!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["gmail-auth"]=t():e["gmail-auth"]=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}({2:function(e,t,r){"use strict";r.r(t);const n=Symbol("privApi"),o=Symbol("privIsDestroyed");var i=class{constructor(e){this[n]=e,this[o]=!1}destroy(){this[o]||(this[o]=!0)}get appVersion(){return this[n].appVersion}get libs(){return this[n].libs}isDestroyed(){return this[o]}getInitialUrl(e,t){return new Error('Subclass does not implement "initialUrl"')}getWindowSettings(){return{}}onMainFrameBeforeRequest(e,t){}onMainFrameHeadersReceived(e,t){}loadURL(e){this[n].loadURL(e)}authSuccess(e){this[n].authSuccess(e)}authFailure(e){this[n].authFailure(e)}};var s=class extends i{getInitialUrl(e,t){return`https://wavebox.io/auth/mailbox_google?${this.libs.querystring.stringify({client_id:t.clientId,client_token:t.clientToken,client_version:this.appVersion})}`}getWindowSettings(){return{title:"Google",height:750}}onMainFrameHeadersReceived(e,t){if(302===t.statusCode){let r;try{r=new this.libs.URL(t.responseHeaders.location||t.responseHeaders.Location,t.url)}catch(e){return}const n=r.toString();n.startsWith("https://wavebox.io/auth/accountgoogle/success")?(e.preventDefault(),this.authSuccess({__cookie__:!0})):n.startsWith("https://wavebox.io/auth/accountgoogle/failure")&&(e.preventDefault(),this.authFailure({error:r.searchParams.get("error")}))}}};t.default=s}})});