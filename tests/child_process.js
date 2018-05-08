        const cp=require("child_process").exec('node -e "for(;true;){}"')
        cp.on('exit',()=>console.log('cp close'))
        setTimeout(()=>{
          const child=require("child_process").exec(`TASKKILL /F /T /PID ${cp.pid}`,(er,out,stder)=>{
            console.log("killed cp",er,out,stder)
          })
          child.on('exit',()=>console.log('child close'))
        },3000)