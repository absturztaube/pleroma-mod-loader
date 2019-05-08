
function PleromaModLoader () {
    
    this.config = {
        'modDirectory': './instance/pleroma-mods/',
        'mods': [
            'catify',
            'custom-styles',
        ]
    };
    
    this.loadedMods = [];
}

PleromaModLoader.prototype.loadMods = function() {
    var self = this;
    for(var mod of self.config.mods) {
        var modPath = self.config.modDirectory + 'pleroma-mod-' + mod + ".js";
        console.log('load ' + mod);
        import(modPath) 
            .then(module => {
                self.loadedMods.push(module.default());
            })
            .catch(err => {
                console.error(err);
            });
    }
}

PleromaModLoader.prototype.run = function() {
    var self = this;
    for(var mod of self.loadedMods) {
        this.running.push(mod());
    }
}

window.pleromaModLoader = new PleromaModLoader();
window.pleromaModLoader.loadMods();
