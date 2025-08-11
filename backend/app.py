from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Alert, Diagnostic
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    CORS(app)

    # Create tables at startup (Flask 3.x compatible)
    with app.app_context():
        db.create_all()

    @app.route('/')
    def home():
        return "Server Monitor API is running."

    @app.route('/healthz')
    def healthz():
        return jsonify(status="ok")


    # Helpers

    REQUIRED_ALERT_FIELDS = ("type", "message", "severity")

    def _validate_alert_dict(d: dict):
        missing = [k for k in REQUIRED_ALERT_FIELDS if k not in d]
        if missing:
            return f"Missing fields: {', '.join(missing)}"
        return None

    def _create_alerts_from_list(items):
        """Create many alerts from a list of dicts. Returns list of new IDs."""
        created_ids = []
        for idx, d in enumerate(items, start=1):
            if not isinstance(d, dict):
                raise ValueError(f"Item #{idx} is not an object")
            err = _validate_alert_dict(d)
            if err:
                raise ValueError(f"Item #{idx}: {err}")
            a = Alert(type=d["type"], message=d["message"], severity=d["severity"])
            db.session.add(a)
            db.session.flush()   # get ID without committing yet
            created_ids.append(a.id)
        db.session.commit()
        return created_ids


    # Alerts

    @app.route('/api/alerts', methods=['GET'])
    def get_alerts():
        alerts = Alert.query.order_by(Alert.timestamp.desc()).all()
        return jsonify([{
            'id': a.id,
            'type': a.type,
            'message': a.message,
            'severity': a.severity,
            'timestamp': a.timestamp.isoformat(),
            'resolved': a.resolved
        } for a in alerts])

    @app.route('/api/alerts', methods=['POST'])
    def post_alert_or_batch():
        payload = request.get_json(force=True, silent=False)

        # Case 1: array of alerts
        if isinstance(payload, list):
            try:
                ids = _create_alerts_from_list(payload)
                return jsonify(success=True, count=len(ids), ids=ids), 201
            except ValueError as e:
                db.session.rollback()
                return jsonify(error=str(e)), 400

        # Case 2: single alert object
        if isinstance(payload, dict):
            err = _validate_alert_dict(payload)
            if err:
                return jsonify(error=err), 400
            a = Alert(
                type=payload['type'],
                message=payload['message'],
                severity=payload['severity']
            )
            db.session.add(a)
            db.session.commit()
            return jsonify(success=True, id=a.id), 201

        # Anything else
        return jsonify(error="Expected a JSON object or array"), 400

    @app.route('/api/alerts/batch', methods=['POST'])
    def post_alerts_batch():
        payload = request.get_json(force=True, silent=False)
        if not isinstance(payload, list):
            return jsonify(error="Expected a JSON array of alerts"), 400
        try:
            ids = _create_alerts_from_list(payload)
            return jsonify(success=True, count=len(ids), ids=ids), 201
        except ValueError as e:
            db.session.rollback()
            return jsonify(error=str(e)), 400

    @app.route('/api/alerts/<int:alert_id>', methods=['PATCH'])
    def resolve_alert(alert_id):
        alert = Alert.query.get_or_404(alert_id)
        alert.resolved = True
        db.session.commit()
        return jsonify({'success': True})


    # Diagnostics (unchanged)

    @app.route('/api/diagnostics', methods=['POST'])
    def post_diagnostic():
        data = request.get_json(force=True) or {}
        diag = Diagnostic(
            cpu_usage=data.get('cpu_usage'),
            memory_usage=data.get('memory_usage'),
            disk_usage=data.get('disk_usage')
        )
        db.session.add(diag)
        db.session.commit()
        return jsonify({'success': True, 'id': diag.id}), 201

    @app.route('/api/diagnostics', methods=['GET'])
    def get_diagnostics():
        diags = Diagnostic.query.order_by(Diagnostic.timestamp.desc()).limit(50).all()
        return jsonify([{
            'id': d.id,
            'cpu_usage': d.cpu_usage,
            'memory_usage': d.memory_usage,
            'disk_usage': d.disk_usage,
            'timestamp': d.timestamp.isoformat()
        } for d in diags])

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
