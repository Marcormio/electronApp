const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const cytoscape = require('cytoscape');
const dagre = require('cytoscape-dagre');

let win;

function createWindow(){
	win = new BrowserWindow({width: 1000, height: 600});
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	win.on('closed', () => {
		win = null;
	});
	win.openDevTools();
	// win.maximize();
}

app.on('ready', createWindow);

app.on('window-all-closed', () =>{
	if(process.platform !== 'darwin'){
		app.quit();
	}
});
