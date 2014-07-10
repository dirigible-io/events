var systemLib = require('system');
var ioLib = require('io');
var entityLib = require('entity');

// create entity by parsing JSON object from request body
exports.createEvent = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "INSERT INTO EVENT (";
        sql += "ID_EVENT";
        sql += ",";
        sql += "DATE_BEGINING";
        sql += ",";
        sql += "DATE_END";
        sql += ",";
        sql += "TIME_BEGINING";
        sql += ",";
        sql += "TIME_END";
        sql += ",";
        sql += "DESCRIPTION";
        sql += ",";
        sql += "LOCATION";
        sql += ") VALUES ("; 
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ")";

        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = db.getNext('EVENT_ID_EVENT');
        statement.setInt(++i, id);
        var js_date_date_begining =  new Date(Date.parse(message.date_begining));
        statement.setDate(++i, new java.sql.Date(js_date_date_begining.getTime() + js_date_date_begining.getTimezoneOffset()*60*1000));
        var js_date_date_end =  new Date(Date.parse(message.date_end));
        statement.setDate(++i, new java.sql.Date(js_date_date_end.getTime() + js_date_date_end.getTimezoneOffset()*60*1000));
        var js_date_time_begining =  new Date(Date.parse(message.time_begining)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_begining.getTime() + js_date_time_begining.getTimezoneOffset()*60*1000));
        var js_date_time_end =  new Date(Date.parse(message.time_end)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_end.getTime() + js_date_time_end.getTimezoneOffset()*60*1000));
        statement.setString(++i, message.description);
        statement.setString(++i, message.location);
        statement.executeUpdate();
        response.getWriter().println(id);
        return id;
    } catch(e) {
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
    return -1;
};

// read single entity by id and print as JSON object to response
exports.readEventEntity = function(id) {
    var connection = datasource.getConnection();
    try {
        var result = "";
        var sql = "SELECT * FROM EVENT WHERE " + pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setString(1, id);
        
        var resultSet = statement.executeQuery();
        var value;
        while (resultSet.next()) {
            result = createEntity(resultSet);
        }
        if(result.length === 0){
            entityLib.printError(javax.servlet.http.HttpServletResponse.SC_NOT_FOUND, 1, "Record with id: " + id + " does not exist.");
        }
        var text = JSON.stringify(result, null, 2);
        response.getWriter().println(text);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

// read all entities and print them as JSON array to response
exports.readEventList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + db.createTopAndStart(limit, offset);
        }
        sql += " * FROM EVENT";
        if (sort !== null) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== null && desc !== null) {
            sql += " DESC ";
        }
        if (limit !== null && offset !== null) {
            sql += " " + db.createLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        var value;
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
        var text = JSON.stringify(result, null, 2);
        response.getWriter().println(text);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

//create entity as JSON object from ResultSet current Row
function createEntity(resultSet, data) {
    var result = {};
	result.id_event = resultSet.getInt("ID_EVENT");
    result.date_begining = new Date(resultSet.getDate("DATE_BEGINING").getTime() - resultSet.getDate("DATE_BEGINING").getTimezoneOffset()*60*1000);
    result.date_end = new Date(resultSet.getDate("DATE_END").getTime() - resultSet.getDate("DATE_END").getTimezoneOffset()*60*1000);
    result.time_begining = new Date(resultSet.getTime("TIME_BEGINING").getTime() - resultSet.getDate("TIME_BEGINING").getTimezoneOffset()*60*1000);
    result.time_end = new Date(resultSet.getTime("TIME_END").getTime() - resultSet.getDate("TIME_END").getTimezoneOffset()*60*1000);
    result.description = resultSet.getString("DESCRIPTION");
    result.location = resultSet.getString("LOCATION");
    return result;
};

// update entity by id
exports.updateEvent = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "UPDATE EVENT SET ";
        sql += "DATE_BEGINING = ?";
        sql += ",";
        sql += "DATE_END = ?";
        sql += ",";
        sql += "TIME_BEGINING = ?";
        sql += ",";
        sql += "TIME_END = ?";
        sql += ",";
        sql += "DESCRIPTION = ?";
        sql += ",";
        sql += "LOCATION = ?";
        sql += " WHERE ID_EVENT = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        var js_date_date_begining =  new Date(Date.parse(message.date_begining));
        if(js_date_date_begining !== null) {
            statement.setDate(++i, new java.sql.Date(js_date_date_begining.getTime() + js_date_date_begining.getTimezoneOffset()*60*1000));
        } else {
            statement.setDate(++i, null);
        }
        var js_date_date_end =  new Date(Date.parse(message.date_end));
        if(js_date_date_end !== null) {
            statement.setDate(++i, new java.sql.Date(js_date_date_end.getTime() + js_date_date_end.getTimezoneOffset()*60*1000));
        } else {
            statement.setDate(++i, null);
        }
        var js_date_time_begining =  new Date(Date.parse(message.time_begining)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_begining.getTime() + js_date_time_begining.getTimezoneOffset()*60*1000));
        var js_date_time_end =  new Date(Date.parse(message.time_end)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_end.getTime() + js_date_time_end.getTimezoneOffset()*60*1000));
        statement.setString(++i, message.description);
        statement.setString(++i, message.location);
        var id = "";
        id = message.id_event;
        statement.setInt(++i, id);
        statement.executeUpdate();
        response.getWriter().println(id);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

// delete entity
exports.deleteEvent = function(id) {
    var connection = datasource.getConnection();
    try {
        var sql = "DELETE FROM EVENT WHERE "+pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setString(1, id);
        var resultSet = statement.executeUpdate();
        response.getWriter().println(id);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

exports.countEvent = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
        var statement = connection.createStatement();
        var rs = statement.executeQuery('SELECT COUNT(*) FROM EVENT');
        while (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
    response.getWriter().println(count);
};

exports.metadataEvent = function() {
	var entityMetadata = {};
	entityMetadata.name = 'event';
	entityMetadata.type = 'object';
	entityMetadata.properties = [];
	
	var propertyid_event = {};
	propertyid_event.name = 'id_event';
	propertyid_event.type = 'integer';
	propertyid_event.key = 'true';
	propertyid_event.required = 'true';
    entityMetadata.properties.push(propertyid_event);

	var propertydate_begining = {};
	propertydate_begining.name = 'date_begining';
    propertydate_begining.type = 'date';
    entityMetadata.properties.push(propertydate_begining);

	var propertydate_end = {};
	propertydate_end.name = 'date_end';
    propertydate_end.type = 'date';
    entityMetadata.properties.push(propertydate_end);

	var propertytime_begining = {};
	propertytime_begining.name = 'time_begining';
    propertytime_begining.type = 'time';
    entityMetadata.properties.push(propertytime_begining);

	var propertytime_end = {};
	propertytime_end.name = 'time_end';
    propertytime_end.type = 'time';
    entityMetadata.properties.push(propertytime_end);

	var propertydescription = {};
	propertydescription.name = 'description';
    propertydescription.type = 'string';
    entityMetadata.properties.push(propertydescription);

	var propertylocation = {};
	propertylocation.name = 'location';
    propertylocation.type = 'string';
    entityMetadata.properties.push(propertylocation);


    response.getWriter().println(JSON.stringify(entityMetadata));
};

function getPrimaryKeys(){
    var result = [];
    var i = 0;
    result[i++] = 'ID_EVENT';
    if (result === 0) {
        throw new Exception("There is no primary key");
    } else if(result.length > 1) {
        throw new Exception("More than one Primary Key is not supported.");
    }
    return result;
}

function getPrimaryKey(){
	return getPrimaryKeys()[0].toLowerCase();
}

function pkToSQL(){
    var pks = getPrimaryKeys();
    return pks[0] + " = ?";
}

exports.processEvent = function() {
	
	// get method type
	var method = request.getMethod();
	method = method.toUpperCase();
	
	//get primary keys (one primary key is supported!)
	var idParameter = getPrimaryKey();
	
	// retrieve the id as parameter if exist 
	var id = xss.escapeSql(request.getParameter(idParameter));
	var count = xss.escapeSql(request.getParameter('count'));
	var metadata = xss.escapeSql(request.getParameter('metadata'));
	var sort = xss.escapeSql(request.getParameter('sort'));
	var limit = xss.escapeSql(request.getParameter('limit'));
	var offset = xss.escapeSql(request.getParameter('offset'));
	var desc = xss.escapeSql(request.getParameter('desc'));
	
	if (limit === null) {
		limit = 100;
	}
	if (offset === null) {
		offset = 0;
	}
	
	if(!entityLib.hasConflictingParameters(id, count, metadata)) {
		// switch based on method type
		if ((method === 'POST')) {
			// create
			exports.createEvent();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				exports.readEventEntity(id);
			} else if (count !== null) {
				exports.countEvent();
			} else if (metadata !== null) {
				exports.metadataEvent();
			} else {
				exports.readEventList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			exports.updateEvent();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityLib.isInputParameterValid(idParameter)){
				exports.deleteEvent(id);
			}
		} else {
			entityLib.printError(javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST, 1, "Invalid HTTP Method");
		}
	}
	
	// flush and close the response
	response.getWriter().flush();
	response.getWriter().close();
};
