<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <title>ClinicFlow — API Dokumentacija</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { background: #0d9488 !important; }
    .topbar-wrapper img { display: none; }
    .topbar-wrapper::after {
      content: "ClinicFlow API";
      color: white;
      font-size: 1.4rem;
      font-weight: 700;
      padding: 0 20px;
    }
    .info .title { color: #0d9488; }
  </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
SwaggerUIBundle({
  url: "/api/openapi.yaml",
  dom_id: '#swagger-ui',
  deepLinking: true,
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
  layout: "BaseLayout",
  tryItOutEnabled: true,
  requestInterceptor: (req) => {
    const token = localStorage.getItem('cf_token');
    if (token) req.headers['Authorization'] = 'Bearer ' + token;
    return req;
  }
});
</script>
</body>
</html>
