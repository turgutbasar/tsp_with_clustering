var Loading = function () { };

    Loading.Start = function (message, cfg, force) {
        if (force!=undefined && sync!=undefined) {
            return;
        }
        if (cfg == null) {
            $.blockUI({
                message: '<i class="icon-spinner10 spinner"></i>  ' + message + '...',
                overlayCSS: {
                    backgroundColor: '#1b2024',
                    opacity: 0.8,
                    zIndex: 1200,
                    cursor: 'wait'
                },
                css: {
                    border: 0,
                    color: '#fff',
                    padding: 0,
                    zIndex: 1201,
                    backgroundColor: 'transparent'
                }
            });
        } else {
            cfg.message = '<i class="icon-spinner10 spinner"></i>  ' + message + '...';
            $.blockUI(cfg);
        }
    };

    Loading.Stop = function (force) {
        if (force!=undefined && sync!=undefined) {
            return;
        }
        $.unblockUI();
    };
    
window.Loading = Loading;