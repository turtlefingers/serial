let port;
let reader;

function ConnectSerial() {
  let elem = document.createElement("div");
  elem.style = "display:flex;color:black;align-items: center;justify-content:center;position:fixed;z-index:999;left:0;right:0;top:0;bottom:0;background:white;"
  elem.innerHTML = "<span>화면을 클릭하면 시리얼통신을 연결합니다</span>" ;
  document.body.append(elem);
  elem.addEventListener("click",()=>{
    onConnectSerial();
    elem.remove();
  });
}

async function onConnectSerial() {
  // 사용자가 시리얼 포트를 선택하도록 요청합니다.
  port = await navigator.serial.requestPort();

  console.clear();
  // 선택된 포트를 엽니다. 9600 baudRate를 예로 들었습니다.
  await port.open({ baudRate: 9600 });

  console.clear();
  // ReadableStream을 통해 데이터를 읽습니다.
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  reader = textDecoder.readable.getReader();

  console.clear();
  // 데이터를 읽는 루프를 시작합니다.
  readLoop();
}


let prevData;

async function readLoop() {
  while (true) {
    try {
      const { value, done } = await reader.read();
      if (done) {
        // 리더 스트림이 닫혔을 때 루프를 종료합니다.
        reader.releaseLock();
        ConnectSerial();
        break;
      }
      if (value) {
        // console.log(value);
  
        if(prevData && prevData.time == Date.now()) prevData.value += value;
        else {
          prevData = {value:""+value,time:Date.now()};
          setTimeout(()=>{
            if(prevData.value.includes(",")){
              let v = prevData.value.split(",");
              for(let i=0; i<v.length; i++){
                v[i] = parseFloat(v[i]);
              }
              if(v!=NaN && v!=undefined)window.serialValue = v;
            }
            else{
              let v = parseFloat(prevData.value);
              if(v!=NaN && v!=undefined)window.serialValue = v;
            }
          },1);
        }
      }
    } catch (error) {
      // 오류가 발생하면 콘솔에 오류를 출력하고 루프를 종료합니다.
      console.error(error);
      reader.releaseLock();
      ConnectSerial();
      break;
    }
  }
}