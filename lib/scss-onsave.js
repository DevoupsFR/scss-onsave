'use babel';

import {existsSync, readFileSync} from 'fs';
import { CompositeDisposable } from 'atom';
import {join, relative, dirname, extname} from 'path';
import {exec} from 'child_process';

const CONFIGS_FILENAME = '.scss-onsave.json';
const EXEC_TIMEOUT = 60 * 1000; // 1 minute

export default {
    
    activate()
    {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
            this.subscriptions.add(textEditor.onDidSave(this.handleDidSave.bind(this)));
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', 'scss-onsave:force-compile', this.force_compile.bind(this)));
    },
    deactivate()
    {
        this.subscriptions.dispose();
    },
    handleDidSave(event)
    {
        this.savedFileDir = null
        this.recompile = false;
        
		if(typeof(event.path) !== 'string' || extname(event.path) !== '.scss' && extname(event.path) !== '.sass')
			return null;
		let savedFile = event.path;
		this.savedFileDir = dirname(savedFile);
        
		this.run();
        return null;
    },
    force_compile(event)
    {
		this.savedFileDir = null
		this.recompile = false;
        
		let editor = atom.workspace.getActiveTextEditor();
		if(typeof(editor) === 'undefined')
			return null;
		this.savedFileDir = dirname(editor.getPath());
		this.recompile = true;
		
		this.run();
        return null;
    },
	run()
	{
        if(typeof(this.savedFileDir) === 'undefined' || this.savedFileDir === null)
            return null;
		
		this.rootDir = this.findConfigFile(this.savedFileDir);
		if(typeof(this.rootDir) === 'undefined' || this.rootDir === null)
		{
			return null;
		}
		this.configs = this.readConfigFile();
		if(typeof(this.configs) === 'undefined' || this.configs === null)
		{
			return null;
		}
		
		if(typeof(this.configs.inputDir) === 'undefined' || typeof(this.configs.outputDir) === 'undefined')
		{
			atom.notifications.addError('scss-onsave: Configuration error', {detail: 'Please specify inputDir and outputDir path.', dismissable: true});
			return null;
		}
        
		this.compileFiles();
	},
    compileFiles()
    {
		if(this.configs.showStartup)
		{
			atom.notifications.addSuccess('scss-onsave: Compilation started', { dismissable: false});
		}
		let command = this.makeCommand();
		let options = {cwd: this.rootDir, timeout: EXEC_TIMEOUT};
		exec(command, options, (err, stdout, stderr) =>
		{
			let output = stdout.trim();
			let error = stderr.trim() || (err && err.message);
			//Si on doit afficher la reussite
			if(this.configs.showOutput && output && error === null)
			{
				atom.notifications.addSuccess('scss-onsave: Command succeeded', {detail: output, dismissable: false});
			}
			if(this.configs.showError && error)
			{
				atom.notifications.addError('scss-onsave: Command failed', {detail: output, description:error, dismissable: true});
			}
		});
    },
	makeCommand()
	{
		let command = '';
		if(this.configs.useNpmSass === true)
		{
			command = 'sass'+(this.recompile === false ? ' --update' : '');
			command += ' --style="'+this.configs.style+'"';
			command += (this.configs.sourcemap === 'none') ? ' --no-source-map' : ' --source-map-urls="'+this.configs.sourcemap+'"';
			command += ' '+this.rootDir+this.configs.inputDir+':'+this.rootDir+this.configs.outputDir;
		}
		else
		{
			command = 'scss --update';
			command += ' --cache-location='+this.rootDir+this.configs.inputDir+'.sass-cache/';
			command += ' --sourcemap='+this.configs.sourcemap;
			command += ' --style='+this.configs.style;
	        command += ' --default-encoding="'+this.configs.charset+'"';
			command += ' '+this.rootDir+this.configs.inputDir+':'+this.rootDir+this.configs.outputDir;
			
			if(this.configs.sass === true)
				command +=  ' --sass';
			if(this.recompile === true)
				command += ' --force';
		}
		return command;
	},
	readConfigFile()
	{
	    let file_path = join(this.rootDir, CONFIGS_FILENAME);
	    let file_content = readFileSync(file_path, 'utf8');
		configs = JSON.parse(file_content);
		configs.useNpmSass	= typeof(configs.useNpmSass) === 'undefined' ? false : configs.useNpmSass;
		configs.showStartup	= typeof(configs.showStartup) === 'undefined' ? false : configs.showStartup;
		configs.showOutput	= typeof(configs.showOutput) === 'undefined' ? false : configs.showOutput;
		configs.showError	= typeof(configs.showError) === 'undefined' ? true : configs.showError;
		configs.style		= typeof(configs.style) === 'undefined' ? 'compressed' : configs.style;
		
		if(configs.useNpmSass === true)
		{
			configs.sourcemap	= typeof(configs.sourcemap) === 'undefined' ? false : configs.sourcemap;
		}
		else
		{
			configs.sourcemap	= typeof(configs.sourcemap) === 'undefined' ? 'none' : configs.sourcemap;
			configs.sass		= typeof(configs.sass) === 'undefined' ? false : configs.sass;
			configs.charset   	= typeof(configs.charset) === 'undefined' ? 'UTF-8' : configs.charset;
		}
		
		return configs;
	},
	findConfigFile(dir)
	{
		if(existsSync(join(dir, CONFIGS_FILENAME)))
			return dir+'/';
		let parentDir = join(dir, '..');
		if(parentDir === dir)
			return undefined;
		return this.findConfigFile(parentDir);
	},
};
