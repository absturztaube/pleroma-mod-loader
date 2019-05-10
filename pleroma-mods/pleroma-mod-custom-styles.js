
PleromaModCustomStyles = function () {
    this.config = {
        'stylesheet': 'pleroma-mod-custom-styles.css'
    };
}

PleromaModCustomStyles.prototype.run = function() {
    var head = document.getElementsByTagName('head')[0];
    var stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', window.__pleromaModLoader.config.modDirectory + 'pleroma-mod-custom-styles.css');
    head.appendChild(stylesheet);
};

window.__pleromaModLoader.registerClass('PleromaModCustomStyles', PleromaModCustomStyles);
