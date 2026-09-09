/** Minimal Prometheus /metrics endpoint (no extra npm dependency). */

export function metricsMiddleware(serviceName) {
	let requests = 0;

	return (req, res, next) => {
		if (req.path === '/metrics') {
			res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
			res.end(
				`# HELP http_requests_total Total HTTP requests\n` +
				`# TYPE http_requests_total counter\n` +
				`http_requests_total{service="${serviceName}"} ${requests}\n` +
				`# HELP process_up 1 if the process is running\n` +
				`# TYPE process_up gauge\n` +
				`process_up{service="${serviceName}"} 1\n`
			);
			return;
		}
		requests += 1;
		next();
	};
}
