var convertToObject = function(value)
{
	if (value == null || typeof(value) != 'string') {
		return null;
	}

	var $process = function(value, isArray)
	{
		var toReturn = (isArray === true ? [] : {});
		var tmp = null;
		var _engine = {
			key: null,
			value: null,
			curlyBracket: {
				in: false,
				priority: 0,
			},
			quote: {
				hasLast: false,
				type: '',
				in: false,
				priority: 0,
			},
			separatorPast: false,
			toNextPoint: false,
			hadQuote: false,
		};

		if (value == null || typeof(value) != 'string') {
			return value;
		}

		for (var i = 0; value[i] != undefined; i++)
		{
			switch (value[i])
			{
				case '[':
				case '{':
					if (_engine.quote.in == true) {
						tmp += value[i];
						break;
					}
					if (_engine.toNextPoint == true) {
						tmp += value[i];
						_engine.curlyBracket.priority += 1;
						break;
					}
					
					tmp = '';
					_engine.toNextPoint = true;
	
				break;
				case '}':
				case ']':
					if (_engine.quote.in == true) {
						tmp += value[i];
						break;
					}
					if (_engine.toNextPoint == false) {
						break;
					}
					if (_engine.curlyBracket.priority != 0) {
						tmp += value[i];
						_engine.curlyBracket.priority -= 1;
						break;
					}
			
					_engine.toNextPoint = false;
					_engine.value = new $process(tmp, (value[i] == ']' ? true : false));
					tmp = null;
					
				case ':':
				case '=':
					if (_engine.toNextPoint == true || _engine.quote.in == true) {
						tmp += value[i];
						break;
					}

					_engine.hadQuote = false;
					_engine.separatorPast = true;
					_engine.key = (tmp != null ? tmp : _engine.key);
					tmp = null;
				break;
				case '\n':
				case '\r':
				case ',':
				case ';':
					if (_engine.toNextPoint == true || _engine.quote.in == true) {
						tmp += value[i];
						break;
					}

					var tmpValue = (_engine.value == null ? tmp : _engine.value);
					if (_engine.hadQuote === false && tmpValue != null) {
						try { tmp = JSON.parse(tmpValue); tmpValue = tmp; } catch(e) { }
					}
					if (isArray === true && tmpValue != null) {
						toReturn.push(tmpValue);
					} else if (isArray !== true && tmpValue != null) {
						if (_engine.key != null) {
							toReturn[_engine.key] = tmpValue;
						} else {
							toReturn = tmpValue;
						}
					}

					tmp = null;
					_engine.hadQuote = false;
					_engine.key = null;
					_engine.value = null;
					_engine.separatorPast = false;
				break;
				case '\'':
				case '"':
				case '`':
					if (_engine.toNextPoint == true || (_engine.quote.in == true && _engine.quote.type != value[i])) {
						tmp += value[i];
						break;
					}
					_engine.hadQuote = true;
					if (_engine.quote.in == false) {
						tmp = '';
						_engine.quote.in = true;
						_engine.quote.type = value[i];
						_engine.quote.priority += 1;
						break;
					}
					_engine.quote.priority -= 1;
					if (_engine.quote.priority == 0) {
						_engine.quote.hasLast = true;
						_engine.quote.in = false;
					}
					continue;
				break;
				case ' ':
				case '\t':
					if (_engine.toNextPoint == true || _engine.quote.in == true) {
						tmp += value[i];
						break;
					}
				break;
				default:
					if (_engine.quote.hasLast == true) {
						tmp += _engine.quote.type;
						_engine.quote.priority += 1;
						_engine.quote.in = true;
					}
					tmp = (tmp == null ? value[i] : tmp + value[i]);
			}
			_engine.quote.hasLast = false;
		}

		var tmpValue = (_engine.value == null ? tmp : _engine.value);
		if (_engine.hadQuote === false && tmpValue != null) {
			try { tmp = JSON.parse(tmpValue); tmpValue = tmp; } catch(e) { }
		}
		if (isArray === true && tmpValue != null) {
			toReturn.push(tmpValue);
		} else if (isArray !== true && tmpValue != null) {
			if (_engine.key != null) {
				toReturn[_engine.key] = tmpValue;
			} else {
				toReturn = tmpValue;
			}
		}

		return toReturn;
	}
	return new $process(value);
}

try { module.exports = convertToObject; } catch (e) {}
