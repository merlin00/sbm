var _entity_view_html;
var _tpl;
var _title_len = 0;

function import_entity_view(href) {
    var selector = 'link[rel="import"][href="'+ href +'"]'; 
    _entity_view_html = document.querySelector(selector).import;
    _tpl = _entity_view_html.querySelector('link[rel="import"]').import;
    _tpl = _tpl.querySelector('template');
}
 
function attach_entity_view_to(selector) {
    var view = $(_entity_view_html).find('#_entity');
    var list = $(_entity_view_html).find('#_entity #_list'); 
    
    $(view).css('width', "100%");
    $(view).css('height', "100%");

    $(list).css('overflow-y', 'auto');

    $(selector).append(view);

    var child = $(view).children();

    _title_len += $(child[0]).height();
    _title_len += $(child[1]).height() * 2;
    _title_len += $(child[2]).height();

    resize_entity_view();

    $(window).resize(resize_entity_view);

    //$(view).find('#_entities').hide()
    $('.ui.dropdown').dropdown();
}

function resize_entity_view() {
    $('#_entity #_list').height($('#_entity').height() - _title_len);
}

function add_item(topic) {
    var item = _entity_view_html.importNode(_tpl.content, true);
    $(document).find('#_entity #_list').append(item);
}

$(document).ready(function() {
    console.log('ready');
    add_item("test");

})

