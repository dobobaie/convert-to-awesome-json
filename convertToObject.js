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
		};

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
					if (_engine.quote.in == false) { //  && _engine.separatorPast == true) {
						tmp = '';
						_engine.toNextPoint = true;
						break;
					}
				break;
				case '}':
				case ']':
					if (_engine.quote.in == true) {
						tmp += value[i];
						break;
					}
					if (_engine.toNextPoint == true && _engine.curlyBracket.priority != 0) {
						tmp += value[i];
						_engine.curlyBracket.priority -= 1;
						break;
					}
					if (_engine.curlyBracket.priority == 0 && tmp != null) {
						_engine.toNextPoint = false;
						_engine.value = new $process(tmp, (value[i] == ']' ? true : false));
						tmp = null;
						break;
					}
				case ':':
				case '=':
					if (_engine.toNextPoint == true || _engine.quote.in == true) {
						tmp += value[i];
						break;
					}
					if (tmp != null) {
						_engine.key = tmp;
						tmp = null;
					}
					_engine.separatorPast = true;
				break;
				case '\n':
				case '\r':
				case ',':
				case ';':
					if (_engine.toNextPoint == true || _engine.quote.in == true) {
						tmp += value[i];
						break;
					}
					if (isArray === true && (_engine.value != null || tmp != null)) {
						toReturn.push((_engine.value == null ? tmp : _engine.value));
					} else if ((isArray !== true && _engine.separatorPast == false) || tmp == null) {
						break ;
					} else {
						

						// ---
						if (_engine.key != null) {
							console.log('======>', _engine.key, _engine.value, tmp);
						}
						// ---


						if (_engine.key != null) {
							_engine.value = tmp;
							toReturn[$formatData(_engine.key)] = $formatData(_engine.value);
						} else if (_engine.value != null) {
							toReturn = _engine.value;
						}
					}
					tmp = null;
					_engine.key = null;
					_engine.value = null;
					_engine.separatorPast = false;
				break;
				case '\'':
				case '"':
				case '`':
					if (_engine.toNextPoint == true) {
						tmp += value[i];
						break;
					}
					if (_engine.quote.in == false) {
						tmp = '';
						_engine.quote.in = true;
						_engine.quote.type = value[i];
						_engine.quote.priority += 1;
						break;
					} else if (_engine.quote.type != value[i]) {
						tmp += value[i];
						break;
					} else {
						_engine.quote.priority -= 1;
						if (_engine.quote.priority == 0) {
							_engine.quote.hasLast = true;
							_engine.quote.in = false;
						}
						continue;
					}
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

		if (_engine.key != null) {
			if (tmp != null) {
				_engine.value = tmp;
				tmp = null;
			}
			toReturn[$formatData(_engine.key)] = $formatData(_engine.value);
		} else if (_engine.value != null) {
			toReturn = _engine.value;
		}
		return toReturn;
	}

	$formatData = function(value) {
		if (typeof(value) == 'object') {
			return value;
		}
		if (value != null && value[0] != '"') {
			value[0] = '"';
		}
		if (value != null && value[value.length - 1] != '"') {
			value[value.length - 1] = '"';
		}
		return value;
	}
	return new $process(value);
}

module.exports = convertToObject;
