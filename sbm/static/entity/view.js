var entity_view_doc = document.currentScript.ownerDocument;
var link = entity_view_doc.querySelector('link[rel="import"]');
var template = link.import.querySelector('template');
 
function attach_entity_view_to(selector, width='23em', height='30em') {
    var view = entity_view_doc.querySelector('#view');
    
    $(view).css('width', width)
    $(view).css('height', height)
    $(selector).append(view)

    //$(view).find('#list').hide()
    $('.ui.dropdown').dropdown();
}
