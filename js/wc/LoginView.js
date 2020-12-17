import 
{ 
    deleteChildren, 
    newTag, 
    newTagHTML, 
    newTagClass, 
    newTagChild,
    newTagChildren,
    newTagClassHTML,
    newTagClassChild,
    newTagClassChildren,
    newTagClassHTMLChild,
    newTagClassHTMLChildren,
    newTagId, 
    inputClassName,
    selectClassIdOptionList,
    numberInputMinMaxDefault
}
from "./elemfactory";

import { WCBase, props } from "./WCBase";
import { ApigenRequest } from "../ApigenRequest";

const 
template = document.createElement("template");
template.innerHTML =
`<div id="login-form-container">
    <form method="post">
        <div class="container">
            <div class="btn-cancel"></div>
        </div>
        <div class="container">
            <label for="email"><b>Email</b></label>
            <input id="input-email" type="text" name="email" required>
            <label for="password"><b>Password</b></label>
            <input id="input-password" type="password" name="password" required>
            <button id="btn-login" type="submit">Login</button>
        </div>
    </form>
</div>`;

class LoginView extends WCBase
{
    /**
     * Generates LoginView html, css, and events
     */
    constructor()
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        this._title     = "";

        // -----------------------------------------------
        // - Setup ShadowDOM: set stylesheet and content
        // - from template 
        // -----------------------------------------------
        this.attachShadow({mode : "open"});
        this.setupStyle
        (`* {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        #login-form-container {
            width: 50vw;
            height: 50vh;
            background: ${props.loginFormBgStop1};
            background: linear-gradient(to botton left, ${props.loginFormBgStop1} 10%, ${props.loginFormBgStop2} 48%, ${props.loginFormBgStop3} 52%, ${props.loginFormBgStop4});
            border-radius: 5px;
            border: 1px solid ${props.loginFormBorder};
        }

        input[type=text], input[type=password] {
            width: 100%;
            height: ${props.lineHeight};
            margin: 8px 0;
            padding: 12px 20px;
            display: inline-block;
            color: ${props.loginFormColor};
            background: ${props.loginFormInputBgStop1};
            background: linear-gradient(${props.loginFormInputBgStop1}, ${props.loginFormInputBgStop2});
            border: 1px solid ${props.loginFormInputBorder};
        }

        input[type=text]:active, input[type=password]:active {
            border: 1px solid ${props.loginFormInputBorder};
        }

        input[type=text]:hover, input[type=password]:hover {
            box-shadow: 0 0 2px 5px rgba(${props.loginFormInputHoverGlare}, 0.33);
        }

        button {
            display: inline-block;
            margin: 8px 0;
            padding: 14px 20px;
            cursor: pointer;
            color: ${props.loginFormColor};
            background: linear-gradient(to bottom left, ${props.loginFormButtonBgStop1}, ${props.loginFormButtonBgStop2});
            //height: ${props.lineHeight};
            border-style: solid;
            border-width: 3px;
            border-image-slice: 1;
            border-image-source: linear-gradient(to bottom left, ${props.loginFormButtonBorderStop1} 0%, ${props.loginFormButtonBorderStop2} 48%, ${props.loginFormButtonBorderStop3} 53%, ${props.loginFormButtonBorderStop4} 100%);
            text-align: center;
            text-shadow: 0px 0px 8px #000000;
            text-decoration: none;
        }

        button:active {
            border: 3px solid ${props.loginFormInputBorderActive};
        }

        button:hover {
            -webkit-box-shadow: 0px 0px 10px 1px #fff;
            -moz-box-shadow: 0px 0px 10px 1px #fff;
            box-shadow: 0px 0px 10px 1px #fff;            
        }

        .container {
            padding: 16px;
        }`);
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._inputEmail    = this.shadowRoot.getElementById("input-email");
        this._inputPassword = this.shadowRoot.getElementById("input-password");
        this._btnLogin      = this.shadowRoot.getElementById("btn-login");

        this.attachLoginHandler();
    }

    getLoginButton()
    {
        return this._btnLogin;
    }

    attachLoginHandler()
    {
        this._btnLogin.addEventListener("click", e => {
            const a    = this._inputEmail.value;
            const b = this._inputPassword.value;
            const c = a+b;
            const requestHandler = new ApigenRequest();
            
            requestHandler.login
            (
                {
                   obj: c
                }
            )
            .then(data => { console.log(data);this.emitLoginResult(data); })
            .catch(error => { console.log(error)});
        });
    }

    emitLoginResult(auth)
    {
        window.dispatchEvent(new CustomEvent("login-event", { detail: auth }));
    }
}

window.customElements.define('login-view', LoginView);

export { LoginView }