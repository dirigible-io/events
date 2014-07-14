var systemLib = require('system');
var ioLib = require('io');
var entityLib = require('entity');

// create entity by parsing JSON object from request body
exports.createUser = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "INSERT INTO USER (";
        sql += "USER_ID";
        sql += ",";
        sql += "USER_NAME";
        sql += ",";
        sql += "FULL_NAME";
        sql += ",";
        sql += "EMAIL";
        sql += ") VALUES ("; 
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
        var id = db.getNext('USER_USER_ID');
        statement.setInt(++i, id);
        statement.setString(++i, message.user_name);
        statement.setString(++i, message.full_name);
        statement.setString(++i, message.email);
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
exports.readUserEntity = function(id) {
    var connection = datasource.getConnection();
    try {
        var result = "";
        var sql = "SELECT * FROM USER WHERE " + pkToSQL();
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
exports.readUserList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + db.createTopAndStart(limit, offset);
        }
        sql += " * FROM USER";
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
	result.user_id = resultSet.getInt("USER_ID");
    result.user_name = resultSet.getString("USER_NAME");
    result.full_name = resultSet.getString("FULL_NAME");
    result.email = resultSet.getString("EMAIL");
    return result;
};

// update entity by id
exports.updateUser = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "UPDATE USER SET ";
        sql += "USER_NAME = ?";
        sql += ",";
        sql += "FULL_NAME = ?";
        sql += ",";
        sql += "EMAIL = ?";
        sql += " WHERE USER_ID = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, message.user_name);
        statement.setString(++i, message.full_name);
        statement.setString(++i, message.email);
        var id = "";
        id = message.user_id;
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
exports.deleteUser = function(id) {
    var connection = datasource.getConnection();
    try {
        var sql = "DELETE FROM USER WHERE "+pkToSQL();
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

exports.countUser = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
        var statement = connection.createStatement();
        var rs = statement.executeQuery('SELECT COUNT(*) FROM USER');
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

exports.metadataUser = function() {
	var entityMetadata = {};
	entityMetadata.name = 'user';
	entityMetadata.type = 'object';
	entityMetadata.properties = [];
	
	var propertyuser_id = {};
	propertyuser_id.name = 'user_id';
	propertyuser_id.type = 'integer';
	propertyuser_id.key = 'true';
	propertyuser_id.required = 'true';
    entityMetadata.properties.push(propertyuser_id);

	var propertyuser_name = {};
	propertyuser_name.name = 'user_name';
    propertyuser_name.type = 'string';
    entityMetadata.properties.push(propertyuser_name);

	var propertyfull_name = {};
	propertyfull_name.name = 'full_name';
    propertyfull_name.type = 'string';
    entityMetadata.properties.push(propertyfull_name);

	var propertyemail = {};
	propertyemail.name = 'email';
    propertyemail.type = 'string';
    entityMetadata.properties.push(propertyemail);


    response.getWriter().println(JSON.stringify(entityMetadata));
};

function getPrimaryKeys(){
    var result = [];
    var i = 0;
    result[i++] = 'USER_ID';
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

exports.processUser = function() {
	
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
			exports.createUser();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				exports.readUserEntity(id);
			} else if (count !== null) {
				exports.countUser();
			} else if (metadata !== null) {
				exports.metadataUser();
			} else {
				exports.readUserList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			exports.updateUser();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityLib.isInputParameterValid(idParameter)){
				exports.deleteUser(id);
			}
		} else {
			entityLib.printError(javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST, 1, "Invalid HTTP Method");
		}
	}
	
	// flush and close the response
	response.getWriter().flush();
	response.getWriter().close();
};
