var pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';

var SBMUI = {};
SBMUI.Layout = {};
SBMUI.Table = {};
SBMUI.Sidebar = {};
SBMUI.Toolbar = {};

var Layout = {};
var TableUI = {};
var SidebarUI = {};
var ToolbarUI = {};

// Outline Layout
Layout.Outline = {
    name: 'layout_outline',
    panels: [
        { type: 'left', size: 250, resizable: true, style: pstyle, },
        { type: 'main', style: pstyle + 'border-top: 0px;', content: 'content' },
        { type: 'bottom', size: 350, resizable: true, style: pstyle, content: 'bottom' }
    ]
};

SBMUI.Layout.Outline = $('#layout').w2layout(Layout.Outline);
