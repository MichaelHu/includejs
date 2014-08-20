window.include = (function(){

function include(modName, content){

    // script loaded from remote server
    if('string' == typeof content){
        if(_isDepsReady(modName)){
            _exec(modName, content);
            _afterExec();
        }    
        else{
            _wait(modName, content);
        }
    }

    // from client call, content is function or undefined
    else{
        var callback = content;
        if(!_isDepsReady(modName)){
            _includeDeps(modName);
        }
        _add(modName, callback);
        _load(modName);
    }

}

include._mods = {};

function _load(modName){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('INIT' != mod.state){
        return;
    }

    _get_script(mod.uri);
    mod.state = 'LOADING';
}

function _add(modName, callback){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('LOADED' == mod.state){
        _callback(modName);
        return; 
    }

    mod.callback.push(callback);
}

function _callback(modName){
    var mod = include._mods[modName],
        callbacks;
    if(!mod){
        console.log('no mod defininition');
        return;
    }
   
    callbacks = mod.callback; 
    for(var i=0; i<callbacks.length; i++){
        if('function' == typeof callbacks[i]
            && !callbacks[i].done){
            callbacks[i].apply(window);
            callbacks[i].done = true;
        }
    }
}

function _exec(modName, content){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('LOADED' == mod.state){
        return; 
    }
    else{
        window.eval(content);
        mod.state = 'LOADED';
        mod.content = content;
        _callback(modName);
    }
}

function _afterExec(){
    var mods = include._mods,
        mod;

    for(var i in mods){
        mod = mods[i];
        if('WAIT' == mod.state){
            if(_isDepsReady(i)){
                _exec(i, mod.content);
            }
        }
    }
}

function _wait(modName, content){
    var mod = include._mods[modName];

    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('LOADED' == mod.state){
        return;
    }

    mod.state = 'WAIT';
    mod.content = content;
}

function _get_script(url, callback){
    var script = document.createElement('script');

    script.addEventListener('load', function(e){
        script.removeEventListener('load');
        script.parentNode.removeChild(script);
        'function' == typeof callback && callback();
    }, false);

    script.src = url; 
    document.head.appendChild(script);
}

function _initMods(){
    var links = document.getElementsByTagName('LINK'),
        link,
        mod,
        uri,
        deps;    

    for(var i=0; i<links.length; i++){
        link = links[i]; 
        if('mod-include' == link.rel){
            deps = link.getAttribute('data-deps'); 
            deps = deps.replace(/\s/g, '');

            uri = link.getAttribute('href');
            mod = link.getAttribute('data-mod');
            include._mods[mod] = {
                uri: uri 
                , deps: !deps ? [] : deps.split(',')
                , state: 'INIT'
                , callback: []
            };
        }
    }
}

function _getDeps(modName){
    var mod = include._mods[modName],
        deps;
    if(!mod){
        console.log('no mod defininition');
        return null;
    }
    deps = mod.deps;
    return deps;
}

function _includeDeps(modName){
    var deps = _getDeps(modName);

    if(!deps){
        return; 
    }

    for(var i=0; i<deps.length; i++){
        if(_isInit(deps[i])){
            include(deps[i]);
        } 
    }
}

function _isInit(modName){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return true;
    }
    return 'INIT' == mod.state;
}

function _isReady(modName){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return true;
    }
    return 'LOADED' == mod.state;
}

function _isDepsReady(modName){
    var deps = _getDeps(modName);

    if(!deps){
        return true; 
    }

    for(var i=0; i<deps.length; i++){
        if(!_isReady(deps[i])){
            return false;
        } 
    }
    return true;
}

_initMods();
console.log(include._mods);

return include;

})();
