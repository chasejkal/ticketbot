const { bot, config, lang } = require('../index')

if(config.Transcripts.Enabled && config.Transcripts.SelfHost) {
    const Express = require('express')
    const favicon = require('serve-favicon')
    const requestIp = require('request-ip');
    const fs = require('fs')
    const Utils = require('../Modules/Utils')
    const TUtils = require('../Modules/Ticket')
    
    const app = Express()
    
    app.use(requestIp.mw())
    app.use(Express.json())
    app.use(Express.static('./Public/'));
    app.use(Express.urlencoded({ extended: false }))
    
    const send404 = (req, res) => {
        Utils.logWeb(`404 ${req.method} • ${req.clientIp} » ${req.url}`)
        res.status(404).sendFile(__dirname + '/Public/404.html');
    }
    
    if(fs.existsSync('./Transcript/Public/favicon.ico')) {
        app.use(favicon('./Transcript/Public/favicon.ico'));
    }
    
    app.get('/test/:id', async (req, res) => {
        try {
            const { id } = req.params
            if(!id) {
                return send404(req, res)
            } else {
                let data = await TUtils.db.ticket.findById(id);
                if(!data) {
                    return send404(req, res)
                } else {
                    const transcriptFile = fs.readFileSync(`./Transcript/Public/${id}.html`)
                    if(!transcriptFile) {
                        return send404(req, res)
                    } else {
                        Utils.logWeb(`200 ${req.method} • ${req.clientIp} » ${req.url}`)
                        res.status(200).sendFile(__dirname + `/Public/${id}.html`);
                    }
                }
            }
        } catch (e) {
            return send404(req, res)
        }
    })
    
    app.get('/style/css', (req, res) => {
        Utils.logWeb(`200 ${req.method} • ${req.clientIp} » ${req.url}`)
        res.status(200).sendFile(__dirname + `/Public/style.css`);
    })
    
    app.get('*', (req, res) => {
        send404(req, res)
    })
    
    if(config.Transcripts.Enabled) {
        app.listen(config.Transcripts.Port, () => {
            Utils.logInfo(`Transcript Server now listening on port ${config.Transcripts.Port}`)
        })
    }
}