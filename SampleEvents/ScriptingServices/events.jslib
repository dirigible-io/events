var systemLib = require('system');
var ioLib = require('io');
var entityLib = require('entity');

// create entity by parsing JSON object from request body
exports.createEvents = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "INSERT INTO EVENTS (";
        sql += "EVENT_ID";
        sql += ",";
        sql += "DATE_BEGINING";
        sql += ",";
        sql += "TIME_BEGINING";
        sql += ",";
        sql += "DATE_END";
        sql += ",";
        sql += "TIME_END";
        sql += ",";
        sql += "LOCATION";
        sql += ",";
        sql += "DESCRIPTION";
        sql += ",";
        sql += "CREATOR_ID";
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
        sql += ",";
        sql += "?";
        sql += ")";

        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = db.getNext('EVENTS_EVENT_ID');
        statement.setInt(++i, id);
        var js_date_date_begining =  new Date(Date.parse(message.date_begining));
        statement.setDate(++i, new java.sql.Date(js_date_date_begining.getTime() + js_date_date_begining.getTimezoneOffset()*60*1000));
        var js_date_time_begining =  new Date(Date.parse(message.time_begining)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_begining.getTime() + js_date_time_begining.getTimezoneOffset()*60*1000));
        var js_date_date_end =  new Date(Date.parse(message.date_end));
        statement.setDate(++i, new java.sql.Date(js_date_date_end.getTime() + js_date_date_end.getTimezoneOffset()*60*1000));
        var js_date_time_end =  new Date(Date.parse(message.time_end)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_end.getTime() + js_date_time_end.getTimezoneOffset()*60*1000));
        statement.setString(++i, message.location);
        statement.setString(++i, message.description);
        statement.setInt(++i, message.creator_id);
        statement.executeUpdate();
        var index;
        sql = "INSERT INTO PARTICIPANTS (ID, EVENT_ID, USER_ID) VALUES (?,?,?)"
        for(index = 0; index < message.participants.length; index++){
            i = 0;
            statement = connection.prepareStatement(sql);
            var idp = db.getNext("PARTICIPANTS_ID");
            statement.setInt(++i, idp);
            statement.setInt(++i, id);
            statement.setInt(++i, message.participants[index].user_id);
            statement.executeUpdate();
        }
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
exports.readEventsEntity = function(id) {
    var connection = datasource.getConnection();
    response.setCharacterEncoding("UTF-8");
    try {
        var result = "";
        var sql = "SELECT * FROM EVENTS WHERE " + pkToSQL();
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
exports.readEventsList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    response.setCharacterEncoding("UTF-8");
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + db.createTopAndStart(limit, offset);
        }
        sql += " * FROM EVENTS WHERE CURDATE() <= EVENTS.DATE_END";
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
    var connection = datasource.getConnection();
    var i = 0;
    response.setCharacterEncoding("UTF-8");
    try{
        var result = {};
        result.event_id = resultSet.getInt("EVENT_ID");
        result.date_begining = new Date(resultSet.getDate("DATE_BEGINING").getTime() - resultSet.getDate("DATE_BEGINING").getTimezoneOffset()*60*1000);
        result.time_begining = new Date(resultSet.getTime("TIME_BEGINING").getTime() - resultSet.getDate("TIME_BEGINING").getTimezoneOffset()*60*1000);
        result.date_end = new Date(resultSet.getDate("DATE_END").getTime() - resultSet.getDate("DATE_END").getTimezoneOffset()*60*1000);
        result.time_end = new Date(resultSet.getTime("TIME_END").getTime() - resultSet.getDate("TIME_END").getTimezoneOffset()*60*1000);
        result.location = resultSet.getString("LOCATION");
        result.description = resultSet.getString("DESCRIPTION");
        result.creator_id = resultSet.getInt("CREATOR_ID");
        var sql = "SELECT USER_ID FROM PARTICIPANTS WHERE EVENT_ID = ?";
        var statement = connection.prepareStatement(sql);
        statement.setInt(++i, result.event_id);
        var results = statement.executeQuery();
        result.participants = [];
        while(results.next()){
            result.participants.push(results.getInt("USER_ID"));
        }
        return result;
    } catch (e) {
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

// update entity by id
exports.updateEvents = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "UPDATE EVENTS SET ";
        sql += "DATE_BEGINING = ?";
        sql += ",";
        sql += "TIME_BEGINING = ?";
        sql += ",";
        sql += "DATE_END = ?";
        sql += ",";
        sql += "TIME_END = ?";
        sql += ",";
        sql += "LOCATION = ?";
        sql += ",";
        sql += "DESCRIPTION = ?";
        sql += ",";
        sql += "CREATOR_ID = ?";
        sql += " WHERE EVENT_ID = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        var js_date_date_begining =  new Date(Date.parse(message.date_begining));
        statement.setDate(++i, new java.sql.Date(js_date_date_begining.getTime() + js_date_date_begining.getTimezoneOffset()*60*1000));
        var js_date_time_begining =  new Date(Date.parse(message.time_begining)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_begining.getTime() + js_date_time_begining.getTimezoneOffset()*60*1000));
        var js_date_date_end =  new Date(Date.parse(message.date_end));
        statement.setDate(++i, new java.sql.Date(js_date_date_end.getTime() + js_date_date_end.getTimezoneOffset()*60*1000));
        var js_date_time_end =  new Date(Date.parse(message.time_end)); 
        statement.setTime(++i, new java.sql.Time(js_date_time_end.getTime() + js_date_time_end.getTimezoneOffset()*60*1000));
        statement.setString(++i, message.location);
        statement.setString(++i, message.description);
        statement.setInt(++i, message.creator_id);
        var id = "";
        id = message.event_id;
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
exports.deleteEvents = function(id) {
    var connection = datasource.getConnection();
    try {
        var sql = "DELETE FROM EVENTS WHERE "+pkToSQL();
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

exports.countEvents = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
        var statement = connection.createStatement();
        var rs = statement.executeQuery('SELECT COUNT(*) FROM EVENTS');
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

exports.metadataEvents = function() {
	var entityMetadata = {};
	entityMetadata.name = 'events';
	entityMetadata.type = 'object';
	entityMetadata.properties = [];
	
	var propertyevent_id = {};
	propertyevent_id.name = 'event_id';
	propertyevent_id.type = 'integer';
	propertyevent_id.key = 'true';
	propertyevent_id.required = 'true';
    entityMetadata.properties.push(propertyevent_id);

	var propertydate_begining = {};
	propertydate_begining.name = 'date_begining';
    propertydate_begining.type = 'date';
    entityMetadata.properties.push(propertydate_begining);

	var propertytime_begining = {};
	propertytime_begining.name = 'time_begining';
    propertytime_begining.type = 'time';
    entityMetadata.properties.push(propertytime_begining);

	var propertydate_end = {};
	propertydate_end.name = 'date_end';
    propertydate_end.type = 'date';
    entityMetadata.properties.push(propertydate_end);

	var propertytime_end = {};
	propertytime_end.name = 'time_end';
    propertytime_end.type = 'time';
    entityMetadata.properties.push(propertytime_end);

	var propertylocation = {};
	propertylocation.name = 'location';
    propertylocation.type = 'string';
    entityMetadata.properties.push(propertylocation);

	var propertydescription = {};
	propertydescription.name = 'description';
    propertydescription.type = 'string';
    entityMetadata.properties.push(propertydescription);

	var propertycreator_id = {};
	propertycreator_id.name = 'creator_id';
	propertycreator_id.type = 'integer';
    entityMetadata.properties.push(propertycreator_id);


    response.getWriter().println(JSON.stringify(entityMetadata));
};

function getPrimaryKeys(){
    var result = [];
    var i = 0;
    result[i++] = 'EVENT_ID';
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

exports.processEvents = function() {
	
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
			exports.createEvents();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				exports.readEventsEntity(id);
			} else if (count !== null) {
				exports.countEvents();
			} else if (metadata !== null) {
				exports.metadataEvents();
			} else {
				exports.readEventsList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			exports.updateEvents();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityLib.isInputParameterValid(idParameter)){
				exports.deleteEvents(id);
			}
		} else {
			entityLib.printError(javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST, 1, "Invalid HTTP Method");
		}
	}
	
	// flush and close the response
	response.getWriter().flush();
	response.getWriter().close();
};
