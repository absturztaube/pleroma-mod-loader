/*jslint browser, es6, this, fudge */

function PleromaModLoader () {
    this.config = {
        'modDirectory': '/instance/pleroma-mods/',
        'mods': [
            'catify',
            'custom-styles',
            'stickers'
        ]
    };
    this.loadConfig();
    this.loadedMods = {};
    this.classes = {};
}

PleromaModLoader.prototype.loadMods = function() {
    var self = this;
    for (var mod of self.config.mods) {
        var modObject = new PleromaMod(mod);
        modObject.include();
        self.loadedMods[mod] = modObject;
    }
};

PleromaModLoader.prototype.loadHTML = function(method, url, callback, async) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.overrideMimeType('text/xml');
    xmlhttp.onreadystatechange = function () {
        if ( this.readyState == 4 && this.status == 200 ) {
            callback(this);
        }
    };
    xmlhttp.open(method, url, callback, async);
    xmlhttp.send();
};

PleromaModLoader.prototype.loadJSON = function(method, url, callback, async) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.overrideMimeType('text/json');
    xmlhttp.onreadystatechange = function () {
        if ( this.readyState == 4 && this.status == 200 ) {
            this.json = JSON.parse(this.responseText);
            callback(this);
        }
    };
    xmlhttp.open(method, url, callback, async);
    xmlhttp.send();
};

PleromaModLoader.prototype.loadConfig = function () {
    var self = this;
    var url = '/instance/pleroma-mod-config.json';
    self.loadJSON('GET', url, function(response) {
        for(var key in response.json) {
            self.config[key] = response.json[key];
        }
    }, false);
};

PleromaModLoader.prototype.registerClass = function(className, object) {
    var self = this;
    self.classes[className] = object;
};

PleromaModLoader.prototype.waitUntilReady = function () {
    var self = this;
    var postPanel = document.getElementsByClassName('post-status-form');
    if(postPanel.length > 0) {
        for(var modName in self.loadedMods) {
            var mod = self.loadedMods[modName];
            if(mod.instance.onReady) {
                mod.instance.onReady();
            }
        }
        self.createObserver();
    } else {
        window.setTimeout(function() { self.waitUntilReady() }, 1000);
    }
}

PleromaModLoader.prototype.createObserver = function () {
    var self = this;
    self.containers = {
        main: document.getElementsByClassName('main')[0],
        notifications: document.getElementsByClassName('notifications')[0],
    };

    var observerConfig = {subtree: true, childList: true};
    self.observer = new MutationObserver(function (mutations, observer) {
        for(var modName in self.loadedMods) {
            var mod = self.loadedMods[modName];
            if(mod.instance.onMutation) {
                for(var mutation of mutations) {
                    var filter = null;
                    if(mod.instance.config.filter) {
                        filter = new RegExp(mod.instance.config.filter.join('|'));
                    }
                    if(!filter || filter.test(mutation.target.className)) {
                        mod.instance.onMutation(mutation, observer);
                    }
                }
            }
        }
    });
    self.observer.observe(self.containers.main, observerConfig);
    self.observer.observe(self.containers.notifications, observerConfig);
}

function PleromaMod (name) {
    this.name = name;
    this.instance = null;
}

PleromaMod.prototype.getClassName = function() {
    var self = this;
    var className = 'PleromaMod';
    var nameParts = self.name.split('-');
    for(var namePart of nameParts) {
        className += namePart.substring(0,1).toUpperCase();
        className += namePart.substring(1);
    }
    return className;
}

PleromaMod.prototype.include = function () {
    var self = this;
    console.log('loading ' + self.name);
    var body = document.getElementsByTagName('body')[0];
    var script = document.createElement('script');
    script.src = window.__pleromaModLoader.config.modDirectory + 'pleroma-mod-' + self.name + '/mod.js';
    script.type = 'text/javascript';
    script.onload = function () {
        self.modLoaded();
    };
    body.appendChild(script);
};

PleromaMod.prototype.modLoaded = function () {
    var self = this;
    console.log(self.name + ' loaded');
    self.instance = new window.__pleromaModLoader.classes[self.getClassName()]();
    self.run();
};

PleromaMod.prototype.run = function () {
    var self = this;
    if(self.instance) {
        self.instance.run();
    }
};

window.__pleromaModLoader = new PleromaModLoader();
window.__pleromaModLoader.loadMods();
window.__pleromaModLoader.waitUntilReady();
