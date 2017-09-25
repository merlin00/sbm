var popupEntityHtml;

$.get('popup_entity.html', function(data) {
    popupEntityHtml = data;
});

function openPopup() {
    if (!w2ui.popupEntity) {
        $().w2form({
            name: 'popupEntity',
            style: 'border: 0px; background-color: transparent;',
            formHTML: popupEntityHtml,
            fields: [
                { field: 'topic', type: 'alphaNumeric', required: true },
                { field: 'tag_name', type: 'alphaNumeric' },
                { field: 'tag_type', type: 'select', required: false, options: { items: ['Input', 'Output'] } },
            ],
            record: {},
            actions: {
                "save": function() { this.validate(); },
                "reset": function() { this.clear(); },
            }
        });
    }
    $().w2popup('open', {
        title: 'Entity Addition',
        body: '<div id="form" style="width: 100%; height: 100%;"></div>',
        style: 'padding: 0px 0px 0px 0px',
        width: 550,
        height: 260,
        onToggle: function(event) {
            $(w2ui.popupEntity.box).hide();
            event.onComplete = function() {
                $(w2ui.popupEntity.box).show();
                w2ui.popupEntity.resize();
            };
        },
        onOpen: function(event) {
            event.onComplete = function() {
                $('#w2ui-popup #form').w2render('popupEntity');
            };
        }
    });
}
