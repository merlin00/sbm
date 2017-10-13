var _entity_view_html;
var _tpl;
var _max_height, _max_width;

function import_entity_view(href) {
    var selector = 'link[rel="import"][href="'+ href +'"]'; 
    _entity_view_html = document.querySelector(selector).import;
    _tpl = _entity_view_html.querySelector('link[rel="import"]').import;
    _tpl = _tpl.querySelector('template');
}

function resize_view() {
    var view = $('#_entity');
    var child = view.children();
    var row = [ $(child[0]).outerHeight(true),  // Title height			     
	        $(child[1]).outerHeight(true),  // Filter height
	        $(child[2]).outerHeight(true),  // Seperator height
		$(child[3]).outerHeight()]; // entity list height
    var total_height = row[0] + row[1] + row[2] + row[3];
    var list_height;
    
    if(_max_height < total_height) {
	list_height = view.height() - total_height + row[3];
	$('#_entity #_list').height(list_height);
	$('#_entity').css('height', _max_height);
    }
    else {
	view.css('height', total_height);
    }	
}
 
function attach_entity_view_to(selector, max_w, max_h) {
    var view = $(_entity_view_html).find('#_entity');
    var list = $(_entity_view_html).find('#_entity #_list'); 
    

    $(selector).append(view);

    view.css('width', max_w);
    view.css('height', max_h);
    view.css('display','inline-block');
    view.css('margin','0');

    list.css('overflow-y', 'auto');

    _max_width = view.width();
    _max_height = view.height();

    $('.ui.dropdown').dropdown();

    //$(view).find("#_list").hide();
    $(window).resize(resize_view);
    $(view).find("#_refresh_btn").click(refresh);
    $(view).find("#_minimize_btn").click(minimize_view);
    $(view).find("#_maximize_btn").click(show_list);
}

function add_item(entity) {
    var item_html = $(_entity_view_html.importNode(_tpl.content, true));
    var item = item_html.find('.item');
    
    item_html.find('#topic').text(entity['topic']);
    item.attr('id', entity['_id']);
    item.data(entity);

    if('status' in entity) {
	console.log("status");
    } else {
	item.find('#_status #_power').removeClass('green').addClass('red');
	item.find('#_status #_link').hide();
	item.find('#_status #_location').hide();
	item.find('#_status #_net').hide();	
    }

    $(document).find('#_entity #_list').append(item_html);    
}

function minimize_view() {
    $(document).find('#_entity #_list').hide();
    $(document).find('#_entity #_filter').hide();

    var view = $('#_entity');
    var child = view.children();
    var row = $(child[0]).outerHeight(true);  // Title height
    $(view).css('height', row);
}

function show_list() {
    $(document).find('#_entity #_list').show();
    $(document).find('#_entity #_filter').show();
    resize_view();
}

function refresh() {
    var list = $(document).find('#_entity');
    list.append('<div id="_loading" class="ui active inverted dimmer"><div class="ui text loader">Loading</div></div>');

    $.ajax({
	url:"api/entity/all",
	context: document.json
    }).done(function(data) {
	$(document).find('#_entity #_list').children().remove();
	data.forEach(function(entity, i){
	    add_item(entity);
	});
	resize_view();

	setTimeout(function() {
    	    $(document).find('#_entity #_loading').remove();
	}, 500);
    });    
}

$(document).ready(function() {
    refresh();
});

