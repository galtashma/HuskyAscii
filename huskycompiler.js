function HuskyCompiler(){
    
    
    this.nameSet = ['A','I','C', 'S']
    this.renameObj = makeReplaceObj(this.nameSet);

    this.mainLetter = this.nameSet[0];
    this.seconderyLetter = this.nameSet[1];

    this.dictionary = this.generateDictionary();
    this.octalDictionary = (function(){var translate_arr=[]; for (i=0; i<200; i++){translate_arr.push(eval('"\\'+i+'"'));}; return translate_arr;})()

    this.funcWrapper = format('{0}.{0}',this.mainLetter);
    this.dictionaryString = this.getDictionaryAsString();
    this.returnString = this.getExpression('return'); 
    this.quote = this.seconderyLetter;
	//format("{0}({1}+{2}+{3}+{2}+{2})()", this.funcWrapper, this.returnString, this.getExpression("'"), this.getExpression('\\'));

}

HuskyCompiler.prototype.Compile = function(javascript_code) {
    var mainCodeString = this.getExpression(javascript_code);
    var wrappedMainCode = format("{1}({1}({2}+{3}+{0}+{3})())()",mainCodeString, this.funcWrapper, this.returnString, this.quote);
    return this.dictionaryString+wrappedMainCode; 
};

HuskyCompiler.prototype.CompileQuineable = function(javascript_code, quine_name) {
	return this.CompileQuineableHusky(javascript_code, quine_name, this.dictionaryString);
	/*
	javascript_code = format("{2}=(\"{0}\"+f+';f()').replace(/fu.+{[^]/,'f={1}(\"').replace(/[^{)+]+}/g,'\")');", this.dictionaryString.replace(/'\\\\'/g, "\\'\\\\\\\\\\\\\\\\\\\\'").replace(/'\\''/g,"\\'\\\\\\\\\\'\\'") , this.funcWrapper, quine_name, this.getExpression("='\\\\'") , [this.quote, this.getExpression("\\"), this.quote, this.quote].join('+')) + javascript_code;
    var mainCodeString = this.getExpression(javascript_code);
    return format("{4}f={1}(\"({1}({1}({2}+{3}+{0}+{3})()))()\");f()",mainCodeString, this.funcWrapper, this.returnString, this.quote, this.dictionaryString);
	*/
};

HuskyCompiler.prototype.CompileQuineableHusky = function(javascript_code, quine_name, husky_dict)
{
    // How many Slashes do you need to replace a light bulb?
	javascript_code = format("{2}=(\"{0}\"+{3}+';{3}()').replace(/fu.+{[^]/,'{3}={1}(\"').replace(/[^{)+/]+}/,'\")');", husky_dict.replace(/'\\\\'/g, "\\'\\\\\\\\\\\\\\\\\\\\'").replace(/'\\''/g,"\\'\\\\\\\\\\'\\'"), this.funcWrapper, quine_name, this.putSymbolsInPlaceholders("_M_S_S_M_S_M_M_S_M")) + javascript_code;
	//javascript_code = format("{2}=(\"{0}\"+f+';f()').replace({3},'\\\\\\\\').replace(/'''/,'\\'\\\\\\'\\'').replace(/fu.+{[^]/,'f={1}(\"').replace(/[^{)+]+}/,'\")');", husky_dict, this.funcWrapper, quine_name,this.getExpression("\\\\")) + javascript_code;
    var mainCodeString = this.getExpression(javascript_code);
    return format("{4}{5}={1}(\"({1}({1}({2}+{3}+{0}+{3})()))()\");{5}()",mainCodeString, this.funcWrapper, this.returnString, this.quote, this.dictionaryString, this.putSymbolsInPlaceholders("_M_S_S_M_S_M_M_S_M"));
}

/*
HuskyCompiler.prototype.getExpression = function(str) {
	if(str.match(/ +/)){
	    return this._getExpression(str, str);
	}
	return this._getExpression(str, ' ');
}

HuskyCompiler.prototype._getExpression = function(str, split) {
    var parts = str.split(split);
    var expressionParts = []

    for(index in parts){
        var part = parts[index]
        if(index != parts.length-1){
            part += split;
        }

        expression = this.getExpressionShortcut(part);

        if(expression != undefined){
            expressionParts.push(expression)
        } else if( split!=''){
            expressionParts.push(this._getExpression(part, split.slice(1)) )
        } else {
            expressionParts.push(this.octalStringtoExpression(this.stringToOctal(part)))
        }
    }
    return this.putSymbolsInPlaceholders(expressionParts.join('+'));
};
*/

HuskyCompiler.prototype.getExpression = function(str) {
	var arr={};
	var regex = '/';
    for(i in this.dictionary){
		var val = this.dictionary[i];
		if(typeof(val) == "function") continue;
        arr[val] = this.mainLetter+'.'+i;
		if (val == '\\') val = '\\\\';
		regex += val + '|';
    }
	regex += './g';
	reg = eval(regex);
	var that = this;
	return this.putSymbolsInPlaceholders(str.replace(reg, function(match){
		var expr = arr[match];
		if(expr != undefined) return expr + '+';
		else return that.octalStringtoExpression(that.stringToOctal(match)) + '+';
	}).slice(0,-1));
}

HuskyCompiler.prototype.stringToOctal = function(str) {
    var translate_arr=this.octalDictionary;
    var msg = ''
    
    for(index in str){
        var ch = str[index]
        msg += '\\'+translate_arr.indexOf(ch);
    }
    return msg
};

HuskyCompiler.prototype.octalStringtoExpression = function(octalStr) {
    var dict=this.dictionary;
    var arr={};

    for (i in dict) {
        arr[dict[i]] = format('{0}.{1}',this.mainLetter,this.putSymbolsInPlaceholders(i+''));
    } 

    chars = [];
    for(index in octalStr){
        ch = octalStr[index];
        if(typeof ch == 'string' && arr[ch] != undefined){
            chars.push(arr[ch]);
        }
    }
    return chars.join('+');
};

HuskyCompiler.prototype.getExpressionShortcut = function(str) {
    var dict = this.dictionary;
    var arr={}; 
    for(i in dict){
        arr[dict[i]] = this.mainLetter+'.'+i;
    } 
    return arr[str];
};

HuskyCompiler.prototype.generateDictionary = function() {
    _M=+[];
	_S='\'';
    _M_M=[];
    _M_S='';
    _M={
		_S_S:[],
        _M_M_M_M:(!_M_M+_M_S)[_M],
        _S_S_S:_M++,
        _M_S_M_S:(!_M_M+_M_S)[_M],
        _S_S_M:_M++,
        _M_S_M_M:({}+_M_S)[_M],
        _M_M_S_M:((_M_M[+_M_M])+_M_S)[_M],
        _S_M_S:_M++,
        _S_M_M:_M++,
        _M_M_M_S:(!_M_M+_M_S)[_M],
        _M_S_S:_M++,
        _M_M_S_S:({}+_M_S)[_M],
        _M_S_M:_M++,
        _M_M_S:_M++,
		_S:([]+{})[_M],
        _M_M_M:_M++,
        _M_S_S_S:_M++,
        _M_S_S_M:_M++
    };
	_M._S+=_M._S;
	_M._S_S=_M._S+_M._S+_M._S+_M._S+_M._S;
    _M._S_M='\\';
    _M._M_M=(!!_M_M+_M_S)[_M._S_S_M]+_M._M_M_M_S+(!!_M_M+_M_S)[_M._S_S_S]+(!!_M_M+_M_S)[_M._S_M_S]+(!!_M_M+_M_S)[_M._S_S_M]+((_M_M[+_M_M])+_M_S)[_M._S_S_M];
    _M._M_S=_M._M_M_S_S+(({}+_M_S)+_M_S)[_M._S_S_M]+((_M_M[+_M_M])+_M_S)[_M._S_S_M]+(!_M_M+_M_S)[_M._S_M_M]+(!!_M_M+_M_S)[_M._S_S_S]+(!!_M_M+_M_S)[_M._S_S_M]+(!!_M_M+_M_S)[_M._S_M_S]+_M._M_M_S_S+(!!_M_M+_M_S)[_M._S_S_S]+(({}+_M_S)+_M_S)[_M._S_S_M]+(!!_M_M+_M_S)[_M._S_S_M];
    _M._M=_M._S_S_M[_M._M_S][_M._M_S];
    return _M;
};

HuskyCompiler.prototype.getDictionaryAsString = function() {
	
    var func = this.generateDictionary+'';
    
    var lines = func.split('\n');
    lines = lines.slice(1, lines.length-2);
    code = lines.join('').replace(/ +/g, '').replace('\t', '').replace(/(\r\n|\n|\r)/gm,"");
    
    return this.putSymbolsInPlaceholders(code);
};


HuskyCompiler.prototype.putSymbolsInPlaceholders = function(codeStr){
    var ro = this.renameObj
    return codeStr.replace(/(_[SM])+/g, function(match){return ro.replaceReply(match)});
};



/*********** NAME REPLACER  ***********/

// an object used to make new names from the nameSet.
function makeReplaceObj(names){
    return {
        id : [],  // identification
        nameSet: names, // all the names that can assemble a variable name 
        dict : {}, // holds the already determined variable names

        // creates a new name
        incr : function () 
        {
            for(var i = 0;;i++)
            {
                var ix = this.nameSet.indexOf(this.id[i])
                if(ix == this.nameSet.length - 1)
                {
                    this.id[i] = this.nameSet[0]
                }
                else
                {
                    this.id[i] = this.nameSet[ix + 1]
                    break;
                }
            }
            return this.id.join('');
        } ,
        
        // used to reply to messages from the replace (in the next definition)
        replaceReply : function (match) { 
            if(this.dict[match])
            {
                return this.dict[match]
            }
            else
            {
                var x = this.incr()
                this.dict[match]=x;
                return x;
            }
        }
    }
}

/*********** STRINGS ***********/

function format(format){
    var args=[]; for(a in arguments){args.push(arguments[a])};
    args = args.slice(1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
}



/*
(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]
"functi"
(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on'
"function"
'f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on'
"f=function"
'f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)}f()'
"f=function(){alert(1)}f()"
eval('f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)}f()')
SyntaxError: Unexpected identifier
eval('f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)};f()')
undefined
eval('f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)};f()')
undefined
eval('f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)}f()')
SyntaxError: Unexpected identifier
eval('f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)} f()')
SyntaxError: Unexpected identifier
eval('f='+(0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on(){alert(1)};f()')
undefined
eval((0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on f(){alert(1)};f()')
undefined
eval((0[c][c]+'')[0]+(0[c][c]+'')[1]+(0[c][c]+'')[2]+(0[c][c]+'')[3]+(0[c][c]+'')[4]+(0[c][c]+'')[5]+'on f(){alert(1)}f()')
undefined
*/