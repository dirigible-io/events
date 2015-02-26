var systemLib = require('system');

systemLib.println(user);

response.setCharacterEncoding("UTF-8");
response.getWriter().println(user);

response.setContentType("text/html");
response.getWriter().flush();
response.getWriter().close();
