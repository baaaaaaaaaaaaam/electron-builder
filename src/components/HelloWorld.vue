<template>
  <div class="hello">
    <h1>{{version}}</h1>
    <h2>{{status}}</h2>
    <div class="hidden" id="notification">
      <div class="noti-modal">
        <p id="message">{{message}}</p>
        <button @click="restart()"> 재시작 </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
  


export default {
  name: 'HelloWorld',
  data(){
    return{
      version:''
      ,status:''
      ,message:'업그레이드 버전이 있습니다. 프로그램을 재시작 하겠습니다.'
    }
  }
  ,mounted(){
    this.defaultSetting();
  }
  ,methods:{
    defaultSetting(){
      // 앱 시작하면서 버전을 체크하여 background.js 의 ipcMain.on('app_version')을 호출함
      ipcRenderer.send('app_version')
      ipcRenderer.on('app_version',(event,arg)=>{
        console.log('Version ' + arg.version);
        this.version = arg.version
        ipcRenderer.removeAllListeners('app_version');
      })
      ipcRenderer.on('checking-for-update',()=>{
        console.log('checking-for-update')
        this.status = 'checking-for-update'
        ipcRenderer.removeAllListeners('checking-for-update');
      })

      ipcRenderer.on('update-available',()=>{
        console.log('update-available')
        this.status = 'update-available'
        ipcRenderer.removeAllListeners('update-available');
      })

      ipcRenderer.on('update-not-available',()=>{
        console.log('update-not-available')
        this.status = 'update-not-available'
        ipcRenderer.removeAllListeners('update-not-available');
      })


      ipcRenderer.on('update-downloaded',()=>{
        console.log('update-downloaded')
        this.status = 'update-downloaded'
        document.getElementById('notification').classList.remove('hidden')
        ipcRenderer.removeAllListeners('update-downloaded');
      })
    },
    restart(){
      // 재시작 버튼을 누를경우 background.js 의  ipcMain.on('restart_app')을 호출함  
      ipcRenderer.send('restart_app')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.hidden {
  display: none;
}
#notification {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(130, 130, 130,0.7); 

  z-index: 9999;
}

.noti-modal {
position: fixed;
background-color: rgba(255,255,255,1); 


width: 400px;
height: 100px;
padding: 20px;

top: 50%;
left: 50%;
-webkit-transform: translate(-50%, -50%);
-moz-transform: translate(-50%, -50%);
-ms-transform: translate(-50%, -50%);
-o-transform: translate(-50%, -50%);
transform: translate(-50%, -50%);
border-radius: 5px;
box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);

}
</style>
