String.prototype.startsWith = function(str) {
    return (this.indexOf(str) === 0);
}

var Popup = new Class({
    Implements: [Options],

    inline_scripts: [],
    loading_scripts: [],
    loading_css: [],

    options: {
        'width': null,
        'height': null,
        'default_width': 0.5,
        'default_height': 0.8,
    },

    initialize: function(options) {
                    this.setOptions(options);
                    this.overlay = new Element('div', {'class': 'popup_overlay', 'style': 'display: none;'});
                    this.popup = new Element('div', {'class': 'popup', 'style': 'display: none;'});
                    this.popup.addEvent('jsonrpc2_fill_popup', this.jsonrpc2_fill_popup.bind(this));
                    this.popup.addEvent('destroy', this.destroy.bind(this));
                    this.popup.addEvent('hide', this.hide.bind(this));
                    $(window).addEvent('resize', this.set_popup_dimensions.bind(this));
                    this.overlay.addEvent('click', this.hide.bind(this));
                    $(document.body).adopt(this.overlay, this.popup);
                },

    set_popup_dimensions: function() {
                    var window_size = $(window).getSize();
                    var popup_width = (this.options.width) ? this.options.width.toInt() : window_size.x * this.options.default_width;
                    var popup_height = (this.options.height) ? this.options.height.toInt() : null;
                    this.popup.setStyles({
                        'width': popup_width,
                        'left': (window_size.x - popup_width) / 2
                       /* ,
                        'top': (window_size.y - popup_height) / 2*/
                    });
                    if (popup_height) {
                        this.popup.setStyle('height', popup_height);
                    }
            },

    fill_popup: function(html) {
                    this.popup.set('html', html);
                },

    jsonrpc2_fill_popup: function(res) {
                    this.popup.set('html', res.html);
                    this.inline_scripts.append(res.js.inline);
                    res.css.src.each(function(link) {
                        if (!document.getElement('link[href='+link+']')) {
                            this.loading_css.push(link);
                            document.head.adopt(
                                new Element(
                                    'link',
                                    {
                                        'rel': 'stylesheet',
                                        'type': 'text/css',
                                        'href': link
                                    }
                                )
                            );
                            document.body.adopt(
                                new Element(
                                    'object',
                                    {
                                        'data': link,
                                        'type': 'text/css'
                                    }
                                )
                                .addEvent(
                                    'load',
                                    this.handleCssLoad.bind(this)
                                )
                            );
                        }
                    }, this);
                    res.js.src.each(function(link) {
                        if (!document.getElement('script[src='+link+']')) {
                            this.loading_scripts.push(link);
                            document.head.adopt(
                                new Element(
                                    'script',
                                    {
                                        'type': 'text/javascript',
                                        'src': link
                                    }
                                )
                                .addEvent(
                                    'load',
                                    this.handleScriptLoad.bind(this)
                                )
                            );
                        }
                    }, this);
                    this.runInlineScripts();
                },

    handleCssLoad: function(e) {
        this.loading_css.splice(this.loading_css.indexOf(e.target.data), 1);
        e.target.destroy();
        this.runInlineScripts();
    },
    
    handleScriptLoad: function(e) {
        this.loading_scripts.splice(this.loading_scripts.indexOf(e.target.src), 1);
        this.runInlineScripts();
    },

    runInlineScripts: function(){
        if (!this.loading_scripts.length && this.inline_scripts && !this.loading_css.length) {
            document.head.adopt(new Element('script', {'type': 'text/javascript', 'text': this.inline_scripts.join("\n")}));
            this.inline_scripts = [];
        }
    },


    show: function(el) {
                    this.set_popup_dimensions();
                    this.overlay.setStyle('display', '');
                    this.popup.setStyle('display', '');
                    return false;
          },

    hide: function(el) {
                    this.overlay.setStyle('display', 'none');
                    this.popup.setStyle('display', 'none');
                    return false;
          },

    destroy: function(){
                    this.popup.destroy();
                    this.overlay.destroy();
          },
    });


