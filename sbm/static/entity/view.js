var entity_view_doc = document.currentScript.ownerDocument;
var link = entity_view_doc.querySelector('link[rel="import"]');
var tpl = link.import.querySelector('template');
var hdr_len = 0;
 
function attach_entity_view_to(selector) {
    var view = entity_view_doc.querySelector('#view');
    var list = entity_view_doc.querySelector('#_entities'); 
    
    $(view).css('width', "100%");
    $(view).css('height', "100%");

    $(list).css('overflow-y', 'auto');
    $(selector).append(view);

    var a = $(view).children();

    hdr_len += $(a[0]).height();
    hdr_len += $(a[1]).height() * 2;
    hdr_len += $(a[2]).height();
    $(a[3]).height($(view).height() - hdr_len);

    $(window).resize(function(){
	$(a[3]).height($(view).height() - hdr_len)
	console.log(hdr_len);
    });

    //$(view).find('#_entities').hide()
    $('.ui.dropdown').dropdown();
}

function add_item(topic) {
    var item = entity_view_doc.importNode(tpl.content, true);
    $(entity_view_doc).find('#_entities').append(item);
}

function test(){
    console.log($(entity_view_doc).find('#_img').width());
}

$(function(){
    $('div[onload]').trigger('onload');
});


add_item("test")
add_item("test")
add_item("test")
add_item("test")
add_item("test")
add_item("test")
add_item("test")
add_item("test")
