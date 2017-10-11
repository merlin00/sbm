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

    $('.ui.dropdown').dropdown();

    //$(view).find("#_list").hide();
    $(view).find("#_refresh_btn").click(function() {
	refresh();
    });

    $(view).find("#_minimize_btn").click(hide_list);
    $(view).find("#_maximize_btn").click(show_list);
}

function resize_entity_view() {
    $('#_entity #_list').height($('#_entity').height() - _title_len);
}

function add_item(topic) {
    var item = _entity_view_html.importNode(_tpl.content, true);
    $(item).find('#topic').text(topic);
    $(document).find('#_entity #_list').append(item);
}

function hide_list() {
    var list = $(document).find('#_entity #_list');
    list.hide();       
}

function show_list() {
    var list = $(document).find('#_entity #_list');
    list.show();
}

function refresh() {
    var list = $(document).find('#_entity');
    list.append('<div id="_loading" class="ui active inverted dimmer"><div class="ui text loader">Loading</div></div>');

    $.ajax({
	url:"api/entity/all",
	context: document.json
    }).done(function(data) {
	$(document).find('#_entity #_list').children().remove();
	data.forEach(function(v, i){
	    add_item(v.topic);
	});
	setTimeout(function() {
	    $(document).find('#_entity #_loading').remove();
	}, 500);
    });    
}

$(document).ready(function() {
    refresh();
});

