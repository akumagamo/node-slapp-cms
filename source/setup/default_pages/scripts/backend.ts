const BUTTON_MENU_HEIGHT_OPEN : string = "280px";
const BUTTON_MENU_HEIGHT_CLOSED : string = "66px";
const BUTTON_MENU_POSITION_OFFSET : number = 25;
const SCROLL_CHECK_DELAY : number = 250;

class BackendService {
    private openButton : HTMLElement;
    private closeButton : HTMLElement;
    private editButton : HTMLElement;
    private settingsButton : HTMLElement;
    private uploadButton : HTMLElement;
    private isOpen : boolean;
    private buttonMenuContainer : HTMLElement;
    public scrollingTimeout: number = -1;

    constructor() {
        this.isOpen = false;
        this.openButton = document.getElementById("openButton");
        this.closeButton = document.getElementById("closeButton");
        this.editButton = document.getElementById("editButton");
        this.settingsButton = document.getElementById("settingsButton");
        this.uploadButton = document.getElementById("uploadButton");
        this.buttonMenuContainer = document.getElementById("buttonMenuContainer");

        this.attachEvents();
        window.scrollTo(0, 1);
    }

    public toggleButtonMenu() : void {
        if(this.isOpen){
            this.closeButtonMenu();
        }else{
            this.openButtonMenu();
        }
    }

    public openButtonMenu() : void {
        if(!this.isOpen){
            this.buttonMenuContainer.style.height = BUTTON_MENU_HEIGHT_OPEN;
            this.openButton.style.display = "none";
            this.isOpen = true;
        }
    }

    public closeButtonMenu() : void {
        if(this.isOpen){
            this.buttonMenuContainer.style.height = BUTTON_MENU_HEIGHT_CLOSED;
            this.openButton.style.display = "block";
            this.isOpen = false;
        }
    }

    public openEditForm() : void {
        BackendService.redirectTo(location.href + "?edit");
    }

    public openSettingsForm() : void {
        BackendService.redirectTo(location.href + "?settings");
    }

    public openUploadForm() : void {
        BackendService.redirectTo(location.href + "?upload");
    }

    private attachEvents() : void {
        let that = this;

        this.openButton.addEventListener ("click", function (event) : void {
            that.openButtonMenu();
        });

        this.editButton.addEventListener ("click", function (event) : void {
            that.openEditForm();
        });

        this.closeButton.addEventListener ("click", function (event) : void {
            that.closeButtonMenu();
        });

        this.settingsButton.addEventListener ("click", function (event) : void {
            that.openSettingsForm();
        });

        this.uploadButton.addEventListener ("click", function (event) : void {
            that.openUploadForm();
        });

        document.addEventListener ("scroll", function () {
            that.closeButtonMenu();
            that.buttonMenuContainer.style.bottom =  (BUTTON_MENU_POSITION_OFFSET - document.body.scrollTop) +"px";
            that.buttonMenuContainer.style.display = "none";
            window.clearTimeout(that.scrollingTimeout);
            that.scrollingTimeout  = window.setTimeout(function(){
                console.info("Scrolling END");
                that.buttonMenuContainer.style.display = "block";
            }, SCROLL_CHECK_DELAY);
        });
    }

    public static redirectTo (url: string) : void {
        location.href = url;
    }
}

var backendService = new BackendService();