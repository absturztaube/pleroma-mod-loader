
function PleromaStickers (element) {
    if(element.getAttribute('data-picker-init') == 'eeyup') {
        return;
    }

    this.config = {
        'instance': 'https://fedi.absturztau.be',
        'stickersDir': 'pleroma-mod-stickers/',
        'packs': [
            'puniko',
            'puniko_anim',
            'muki',
            'mashiro',
            'animalears',
            'animalears2',
            'hatsune_miku_all_together',
            'hatsune_miku_snow_miku_collection',
            'miko_san_of_fox',
            'mochi',
            'mochi2',
            'mochi3',
            'muki_shy',
            'nekomimi_paradise_1',
            'nekomimi_paradise_2',
            'nekomiya_hinata',
            'nep_nep',
            'nyanko',
            'puniko2',
            'puniko3',
            'puniloli',
            'puni_never_smile',
            'shinigami_cat',
            'shinigami_cat2',
            'shiro_white_neko'
        ],
        'stickerSize': 250,
        'selectHtml': 'pleroma-mod-stickers/sticker-select.html',
    };

    this.open = false;

    this.element = element;
    this.element.setAttribute('data-picker-init', 'eeyup');

    this.createTrigger();
    this.createContainer();
}

PleromaStickers.prototype.createContainer = function() {
    var self = this;
    var stickerContainer = self.element.getElementsByClassName('sticker-container');
    if (stickerContainer.length == 0) {
        self.stickerContainer = document.createElement('div');
        self.stickerContainer.className = 'sticker-container';
    } else {
        self.stickerContainer = stickerContainer[0];
    }
    self.element.appendChild(self.stickerContainer);
};

PleromaStickers.prototype.createTrigger = function () {
    var self = this;
    self.trigger = document.createElement('label');
    self.trigger.className = 'btn btn-default';
    self.trigger.title = 'Stickers';
    self.trigger.onclick = function () {
        self.toggleSelector();
    };

    var icon = document.createElement('i');
    icon.className = 'icon-picture';
    self.trigger.appendChild(icon);

    self.element.getElementsByClassName('media-upload')[0].appendChild(self.trigger);
};

PleromaStickers.prototype.toggleSelector = function() {
    var self = this;
    if(self.open) {
        while(this.stickerContainer.firstChild) {
            this.stickerContainer.removeChild(this.stickerContainer.firstChild);
        }
        self.open = false;
    } else {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.overrideMimeType('text/xml');
        xmlhttp.onreadystatechange = function () {
            if ( this.readyState == 4 && this.status == 200 ) {
                self.stickerContainer.appendChild(this.responseXML.firstChild);
                var tabContainers = self.stickerContainer.getElementsByClassName('tabs');
                for(var tabContainer of tabContainers) {
                    for(var pack of self.config.packs.sort()) {
                        self.addTab(tabContainer, pack);
                    }
                }
            }
        }
        xmlhttp.open('GET', window.__pleromaModLoader.config.modDirectory + self.config.selectHtml, true);
        xmlhttp.send();
        self.open = true;
    }
};

PleromaStickers.prototype.addTab = function (container, pack) {
    var self = this;
    var tabWrapper = document.createElement('div');
    tabWrapper.className = 'tab-wrapper';

    var tabElement = document.createElement('button');
    tabElement.className = 'tab tab-'+pack;
    tabElement.setAttribute('data-pack', pack);
    tabElement.style.backgroundImage
        = 'url("'
        + window.__pleromaModLoader.config.modDirectory
        + self.config.stickersDir
        + pack
        + '/tab_on@2x.png")';
    tabElement.onclick = function () {
        self.getStickers(this.getAttribute('data-pack'));
    };
    
    tabWrapper.appendChild(tabElement);
    container.appendChild(tabWrapper);
};

PleromaStickers.prototype.getStickers = function(pack) {
    var self = this;
    var tabElements = self.stickerContainer.getElementsByClassName('tab');
    for(var tabElement of tabElements) {
        if(tabElement.getAttribute('data-pack') == pack) {
            tabElement.className += ' active';
        } else {
            tabElement.className = tabElement.className.replace(/\s+active/g,'');
        }
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.overrideMimeType('text/json');
    xmlhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var metaData = JSON.parse(this.responseText);
            var rosterContainers = self.stickerContainer.getElementsByClassName('sticker-roster');
            var stickerFooters = self.stickerContainer.getElementsByClassName('sticker-footer');

            var stickerTitle = 'unknown';
            if(metaData.title.en) {
                stickerTitle = metaData.title.en;
            } else {
                stickerTitle = metaData.title[Object.keys(metaData.title)[0]];
            }

            var stickerAuthor = 'LINE';
            if(metaData.author.en) {
                stickerAuthor = metaData.author.en;
            } else {
                stickerAuthor = metaData.author[Object.keys(metaData.author)[0]];
            }

            for(var stickerFooter of stickerFooters) {
                stickerFooter.innerHTML = stickerTitle + ' by ' + stickerAuthor;   
            }

            for(var roster of rosterContainers) {
                while(roster.firstChild) {
                    roster.removeChild(roster.firstChild);
                }
                for(var sticker of metaData.stickers) {
                    var stickerTile = document.createElement('div');
                    stickerTile.className = 'tile tile' + sticker.id;
                    stickerTile.setAttribute(
                        'data-sticker',
                        window.__pleromaModLoader.config.modDirectory
                            + self.config.stickersDir 
                            + pack
                            + '/'
                            + sticker.id + '@2x.png'
                    );
                    var previewImage 
                        = 'url("'
                        + window.__pleromaModLoader.config.modDirectory
                        + self.config.stickersDir 
                        + pack 
                        + '/' 
                        + sticker.id 
                        + '_key@2x.png")';
                    stickerTile.onclick = function() {
                        var sticker = this.getAttribute('data-sticker');
                        self.postSticker(sticker);
                    }
                    stickerTile.style.backgroundImage = previewImage;
                    stickerTile.style.maskImage = previewImage;

                    roster.appendChild(stickerTile);
                }
            }
        }
    }
    xmlhttp.open('GET', window.__pleromaModLoader.config.modDirectory + self.config.stickersDir + pack + '/productInfo.meta', true);
    xmlhttp.send();
};

PleromaStickers.prototype.postSticker = function(sticker) {
    var self = this;
    var textarea = self.element.getElementsByTagName('textarea')[0];
    var type = self.element.getElementsByTagName('select')[0];
    textarea.value += '<br/><img src="'+self.config.instance+sticker+'" width="'+self.config.stickerSize+'" /><br/>';
    textarea.dispatchEvent(new Event('input'));
    type.value = 'text/html';
    type.dispatchEvent(new Event('change'));
};

function PleromaModStickers() {
    this.config = {
        'stylesheet': 'pleroma-mod-stickers.css',
        'filter': [
            'status-el'
        ]
    };

    this.pickers = [];
    this.mainPicker = null;
}

PleromaModStickers.prototype.onMutation = function(mutation, observer) {
    var self = this;
    var icomposers = mutation.target.getElementsByClassName('post-status-form');
    for(var icomposer of icomposers) {
        self.pickers.push(new PleromaStickers(icomposer));
    }
}

PleromaModStickers.prototype.onReady = function () {
    var self = this;
    var composers = document.getElementsByClassName('post-status-form');
    for(var composer of composers) {
        self.mainPicker = new PleromaStickers(composer);
    }
}

PleromaModStickers.prototype.run = function() {
    var self = this;

    var head = document.getElementsByTagName('head')[0];
    var stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', window.__pleromaModLoader.config.modDirectory + 'pleroma-mod-stickers.css');
    head.appendChild(stylesheet);

    return PleromaStickers;
}

window.__pleromaModLoader.registerClass('PleromaModStickers', PleromaModStickers);
