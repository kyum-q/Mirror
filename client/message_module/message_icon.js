// const axios = require('axios');
const { write } = require("fs");
const CMUsers = require("../CMUserInfo");
const fs = require('fs')
const moment = require('moment');

const innerClient = require("./message_mqtt");
const outerClient = require('../mqtt')
let record_obj = require('../message_module/record/new_m_record');
const dbAccess = require("../mirror_db");


let messageAccess = {} // 모듈 제작을 위한 변수

let setCMuser
let setCMFriend
let customOption = false
let customFriend = null

// 성능평가 위한 변수/////////////////////////////////////////////////////////
const mqtt = require('mqtt')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
    host: '192.168.200.171',
    port: 1883
};

let mqttClient = mqtt.connect(options);

let loop = 100;
let startTime;

const PERFORM_EVALUATION = true
const Measure = require("../../evaluation/measure")
// let Measure.audioMeasure = new Measure(loop, "오디오")
// let Measure.imageMeasure = new Measure(loop, "이미지")
// let Measure.textMeasure = new Measure(loop, "텍스트")


mqttClient.on('connect', function () {

    console.log("서버 mqtt와 연결");
    //real time message 받는 토픽
    mqttClient.subscribe(`text`);
    mqttClient.subscribe(`image`);
    mqttClient.subscribe(`audio`);
})

mqttClient.on('message', async (topic, message, packet) => {

    console.log(`${mirrorDB.getId()}/connect_msg 처리`)
    contents = JSON.parse(message);
    connectMsg(contents)

    //client-client간 실시간 메시지
    function connectMsg(contents) {
        switch (contents.type) {
            case "text":
                mirrorDB.createColumns('message', contents)
                    .then(() => {
                        var message_storage = require('./message_storage')
                        var message_obj = require('./message')
                        message_obj.insertNewMessage();
                        message_storage.showMessageStorage();

                        // endTime = new Date();
                        // Measure.textMeasure.putArrivalTime(endTime)
                        // console.log(endTime - startTime);
                    })
                break;
            case "audio":
                new Promise((reslove, reject) => {
                    var save_time = new Date().getTime();

                    var file_name = './message_module/audio/' + save_time + '.wav'; // Client 에 저장되는 파일명
                    var pure_file_name = String(save_time); // DB에 저장될 파일명

                    var bstr = contents.content; // base64String
                    var n = bstr.length;
                    var u8arr = new Uint8Array(n);

                    while (n--) {
                        //byte => unicode로 바꿔서 저장
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    fs.writeFile(file_name, u8arr, 'utf8', (error) => { console.log(u8arr) });
                    reslove(pure_file_name)
                }).then((filename) => {
                    contents.content = filename

                    mirrorDB.createColumns('message', contents)
                        .then(() => {
                            var message_storage = require('./message_storage')
                            var message_obj = require('./message')
                            message_obj.insertNewMessage();
                            message_storage.showMessageStorage();
                        })
                })
                break;


            case "image":
                new Promise((reslove, reject) => {
                    var time = new Date().getTime();
                    var folder = './image/message/'

                    var filename = time;
                    //base64(텍스트) 데이터
                    var base64Url = contents.content;
                    //base64 => bytes
                    var byteData = atob(base64Url);
                    var n = byteData.length;
                    //byte배열 생성, Uint8Array 1개는 1바이트(8bit)
                    var byteArray = new Uint8Array(n); //데이트 크기 만큼 

                    while (n--) {
                        //byte => unicode로 바꿔서 저장
                        byteArray[n] = byteData.charCodeAt(n);
                    }
                    fs.writeFile(folder + filename + '.png', byteArray, 'utf-8', (error) => { });
                    reslove(filename)
                }).then((filename) => {
                    contents.content = filename

                    mirrorDB.createColumns('message', contents)
                        .then(() => {
                            var message_storage = require('./message_storage')
                            var message_obj = require('./message')
                            message_obj.insertNewMessage();
                            message_storage.showMessageStorage();

                            // endTime = new Date();
                            // Measure.imageMeasure.putArrivalTime(endTime)
                            // console.log(endTime - startTime);
                        })
                })

        }
    }
})

const evaluation_button = document.getElementsByClassName('evaluation_button');
if (PERFORM_EVALUATION) {

    let img = document.getElementById('msg-img')
    img.src = "./memo_module/image/test.jpg"

    for (let i = 0; i < evaluation_button.length; i++) {
        evaluation_button[i].style.display = "block";
        evaluation_button[i].addEventListener('click', writeXlsxFile)
    }
}

function writeXlsxFile() {
    if (image.checked == true) Measure.imageMeasure.write("image");
    else if (record.checked == true) Measure.audioMeasure.write("record");
    else Measure.textMeasure.write("text");

}

////////////////////////////////////////////////////////////////////////////

const bar_message_button = document.querySelector("#bar_message_button");
const message_memo_container = document.querySelector("#message_memo_container");
const write_button = document.querySelector("#write_button");
const back_button = document.querySelector("#back_button");
const text_content = document.querySelector("#text_content");
const image_content = document.querySelector("#image_content");
const record_content = document.querySelector("#record_content");
const textArea = document.getElementById('textArea');
textArea.addEventListener('click', function (e) { showKeyboard(e) });

const text = document.querySelector("#text");
const image = document.querySelector("#image");
const record = document.querySelector("#record");
const text_label = document.querySelector("#text_label");
const image_label = document.querySelector("#image_label");
const record_label = document.querySelector("#record_label");
const shutter_button = document.querySelector("#shutter_button");
const send_button = document.querySelectorAll('.send_button');

const send_modal = document.querySelector('#send-modal');
const send_ul = document.querySelector('#otherUserList');
const inside = document.querySelector('#inside');
const outside = document.querySelector('#outside');
const inside_selected = document.querySelector('#inside-selected');
const outside_selected = document.querySelector('#outside-selected');
const inside_label = document.querySelector('#inside-label')
const outside_label = document.querySelector('#outside-label')

const sttRefusalContainer = document.getElementById('stt-refusal-container')
const sttAlert = document.getElementById('stt-alert')
const sttSendButton = document.getElementById('stt-sned-button')

const message_send_watch = document.getElementById('message_send_watch')
const progressbar = document.getElementById("progressbar-container")

messageAccess.setCustomFriend = (new_customFriend) => {
    customFriend = new_customFriend
}

messageAccess.getCustomFriend = () => {
    return customFriend
}

messageAccess.setCMuser = (new_CMuser) => {
    setCMuser = new_CMuser
}

messageAccess.setCMFriend = (new_CMFriend) => {
    setCMFriend = new_CMFriend
}

messageAccess.setcustomOption = (new_customOption) => {
    customOption = new_customOption
}

messageAccess.getcustomOption = () => {
    return customOption
}
document.querySelector('#send-modal-close').addEventListener('click', () => {
    friendAlertOff()
})
function friendAlertOff() {
    send_modal.style.visibility = "hidden";
    inside_selected.style.visibility = 'hidden';
    outside_selected.style.visibility = 'hidden';
    //초기화
    inside.checked = false
    outside.checked = false
}

// message display ON/OFF
bar_message_button.addEventListener('click', () => {
    console.log('bar_message_button click!');

    progressbar.style.display = "none"
    // message_send_watch.style.visibility = "hidden"

    document.querySelector("#textArea").value = "";
    customFriend = null
    customOption = false
    if (message_memo_container.style.display == "none") {
        message_memo_container.style.display = "block"

        sttRefusalContainer.style.display = "none"
        sttSendButton.style = "display: none"

        var contents = document.getElementById('message_storage_detail_contents');
        contents.replaceChildren();

        // text.style.display = "none";
        // image.style.display = "none";
        // record.style.display = "none";
        // document.getElementById('radio_container').style.display = "none";

        //init
        write_button.style.display = "block";
        back_button.style.display = "none";
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";

        // camera on
        innerClient.publish('camera/on', "start");
    }
    // 메시지container가 안보이게 하기
    else {
        if (customOption) {
            customOption = false
        }

        message_memo_container.style.display = "none";
        document.getElementById('msg-img').src = ''
        // camera off
        innerClient.publish('camera/close', 'ok')
    }
})

write_button.addEventListener('click', showWrite);
back_button.addEventListener('click', showStore);

for (let i = 0; i < send_button.length; i++) {
    send_button[i].addEventListener('click', showSendModal);
}

inside.addEventListener('change', showUserBook);
outside.addEventListener('change', showUserBook);

shutter_button.addEventListener('click', () => {
    innerClient.publish('capture/camera', "start");
});
function showSendModal() {


    inside_label.click()
    hideKeyboard();
    console.log("showSendModal");

    MessageSenderView(null)
}

function MessageSenderView() {
    if (customFriend != null) {
        liClickEvent({ id: customFriend.id, name: customFriend.name }, customFriend.send_option)
    }
    else {
        inside_label.click()
        // messageAccess.showUserBook(); 
    }
}

messageAccess.MessageSenderView = MessageSenderView

function showUserBook() {
    send_modal.style.visibility = "visible";
    //
    if (inside.checked == true) {
        console.log('inside.checked == true');
        send_ul.innerHTML = "";
        inside_selected.style.visibility = 'visible';
        outside_selected.style.visibility = 'hidden';

        if (!customOption) {
            setCMuser = CMUsers.setCMUserList()
        }
        setCMuser.then(value => {
            //console.log(`CMUSERS[0] :${value[0].id} `)
            for (let k = 0; k < value.length; k++) {
                let li = document.createElement("li");

                li.style.border = "none";
                li.value = value[k].friend_id;
                const textNode = document.createTextNode(value[k].name);
                const userImg = document.createElement("img");
                userImg.setAttribute("src", "./image/index/user.png");

                li.appendChild(userImg);
                li.appendChild(textNode);

                // connect UI
                if (value[k].connect == 1) {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "green";
                    isConnect.innerHTML = "Online";


                    isConnect.appendChild(circle);
                    li.appendChild(isConnect);
                }
                else {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "gray";
                    isConnect.innerHTML = "Offline";

                    isConnect.appendChild(circle);

                    li.appendChild(isConnect);
                }
                li.addEventListener('click', () => {
                    evaluationTest(value, k);
                }); // end of addEventListener ...
                send_ul.appendChild(li);
            }
        })
    }

    else if (outside.checked == true) { // outside.checked == true
        send_ul.innerHTML = "";

        inside_selected.style.visibility = 'hidden';
        outside_selected.style.visibility = 'visible';
        if (!customOption) {
            setCMFriend = CMUsers.setFriendList()
        }

        setCMFriend.then(value => {
            console.log(`CMUSERS[0] :${value[0].id} `)
            for (let k = 0; k < value.length; k++) {
                let li = document.createElement("li");

                li.style.border = "none";
                li.value = value[k].friend_id;
                const textNode = document.createTextNode(value[k].name);
                const userImg = document.createElement("img");
                userImg.setAttribute("src", "./image/index/user.png");

                li.appendChild(userImg);
                li.appendChild(textNode);

                // connect UI
                if (value[k].connect == 1) {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "green";
                    isConnect.innerHTML = "Online";
                    isConnect.appendChild(circle);

                    li.appendChild(isConnect);
                }
                else {
                    const isConnect = document.createElement("p");
                    const circle = document.createElement("div");

                    circle.style.backgroundColor = "gray";
                    isConnect.innerHTML = "Offline";

                    isConnect.appendChild(circle);
                    li.appendChild(isConnect);
                }

                li.addEventListener('click', () => {
                    liClickEvent(value[k], 1)
                }); // end of addEventListener ...
                send_ul.appendChild(li);

            }
        })
    }
}
let count = 0;
function evaluationTest(value, k) {
    count = 0;

    let type_check = 'text';
    if (image.checked == true) type_check = "image";
    else if (record.checked == true) type_check = "audio";

    if (type_check == "text") { // text 전송일 때
        Measure.textMeasure.startExp()
    }
    else if (type_check == "image") { // image 전송일 때
        Measure.imageMeasure.startExp()
    }
    else { // audio 전송일 때
        Measure.audioMeasure.startExp()
    }

    if (PERFORM_EVALUATION) {

        const performEvalue = setInterval(function () { // 5초 후 실행


            if (count >= loop) {
                clearInterval(performEvalue);
                if (type_check == "text") { // text 전송일 때
                    Measure.textMeasure.endExp()
                }
                else if (type_check == "image") { // image 전송일 때
                    Measure.imageMeasure.endExp()
                }
                else { // audio 전송일 때
                    Measure.audioMeasure.endExp()
                }
            }
            else {
                liClickEvent(value[k], 0)
                startTime = new Date();
                if (type_check == "text") { // text 전송일 때
                    Measure.textMeasure.putDepartureTime(startTime)
                }
                else if (type_check == "image") { // image 전송일 때
                    Measure.imageMeasure.putDepartureTime(startTime)
                }
                else { // audio 전송일 때
                    Measure.audioMeasure.putDepartureTime(startTime)
                }
            }
            count++;
            console.log("################## count :" + count)
            // startTime = new Date();
            // Measure.textMeasure.putDepartureTime(startTime)
        }, 600)

    }
    else {
        liClickEvent(value[k], 0)
    }
}

messageAccess.showUserBook = showUserBook
const liClickEvent = (value, send_option) => new Promise((resolve, reject) => {

    // text, image, audio 3개 중 어떤 경우인지 확인
    let type_check = 'text';
    if (image.checked == true) type_check = "image";
    else if (record.checked == true) type_check = "audio";

    // if (PERFORM_EVALUATION) {
    //     if (type_check == "text") { // text 전송일 때
    //         Measure.textMeasure.putDepartureTime(startTime)
    //     }
    //     else if (type_check == "image") { // image 전송일 때
    //         Measure.imageMeasure.putDepartureTime(startTime)
    //     }
    //     else { // audio 전송일 때
    //         Measure.audioMeasure.putDepartureTime(startTime)
    //     }
    // }
    friendAlertOff()
    //bar_message_button.click();
    var buf;
    let sender = dbAccess.getId(); // 내 id
    let receiver = value.id; // 받는 사람 id
    let connect = value.connect;

    // 현재 시간 가져오기
    var newDate = new Date();
    var send_time = moment(newDate).format('YYYY-MM-DD HH:mm:ss');

    let content = document.querySelector("#textArea").value;

    const data = { // 인자로 보낼 데이터
        sender: sender,
        receiver: receiver,
        content: content,
        type: type_check,
        send_time: send_time
    }

    /* ---------------------- 미러 내 사용자 ---------------------- */
    if (send_option == 0) {
        if (type_check == "text") { // text 전송일 때

            if (PERFORM_EVALUATION) {

                var buf = {
                    sender: "1001",
                    receiver: "4004",
                    content: count + ": 우리의 다음 목표 C&C 페스티벌 1등", //평균 바이트 문자열
                    type: 'text',
                    send_time: send_time
                }

                mqttClient.publish(`text`, JSON.stringify(buf));

                //console.log(count + ' : publish');
                // 텍스트

            }

            else {
                // text 내용 받아오기
                dbAccess.createColumns('message', data)
            }
        }
        else if (type_check == "image") { // image 전송일 때

            let img = document.getElementById('msg-img')
            let c = document.createElement('canvas');
            let ctx = c.getContext('2d');
            c.width = 1280;
            c.height = 720;
            ctx.drawImage(img, 0, 0, c.width, c.height);
            let base64SData = c.toDataURL().split(',')[1];
            buf = {
                receiver: "4004",
                sender: "1001",
                type: 'image',
                content: base64SData,
                send_time: send_time
                // "type": "image",                      
            }
            if (PERFORM_EVALUATION) {
                mqttClient.publish(`image`, JSON.stringify(buf));
            }
            else {
                //서버로 메시지를 보내는 이벤트 publish
                // innerClient.publish('send/image', 'send');
                console.log("image send success");

                dbAccess.createColumns('message', data)
            }
        }
        else { // audio 전송일 때
            if (PERFORM_EVALUATION) {

                var reader = new FileReader(); // new_m_record.js에서 녹음한 blob 객체
                var blob = record_obj.getBlob(); // 컨텐츠를 특정 Blob에서 읽어 옴


                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64 = reader.result; // base64 인코딩 된 스트링 데이터가 result 속성에 담아지게 됩니다.
                    // console.log(`After Audio Base64 : ${base64}`)
                    // var base64Audio = base64.split(',').reverse()[0];
                    var base64Audio = base64.split(',').reverse()[0];
                    console.log(`base64Audio : ${base64Audio}`)

                    new Promise((resolve, reject) => {
                        var bstr = atob(base64Audio); // base64String 
                        var buf = {
                            receiver: "4004",
                            sender: "1001",
                            type: 'audio',
                            content: bstr,
                            send_time: send_time
                        }
                        resolve(buf);
                    }).then((buf) => {

                        // startTime = new Date();
                        // Measure.audioMeasure.putDepartureTime(startTime)
                        mqttClient.publish(`audio`, JSON.stringify(buf));
                    })
                }

                var reader = new FileReader(); // new_m_record.js에서 녹음한 blob 객체
                var blob = record_obj.getBlob(); // 컨텐츠를 특정 Blob에서 읽어 옴


                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64 = reader.result; // base64 인코딩 된 스트링 데이터가 result 속성에 담아지게 됩니다.
                    // console.log(`After Audio Base64 : ${base64}`)
                    // var base64Audio = base64.split(',').reverse()[0];
                    var base64Audio = base64.split(',').reverse()[0];
                    console.log(`base64Audio : ${base64Audio}`)

                    new Promise((resolve, reject) => {
                        var bstr = atob(base64Audio); // base64String 
                        var buf = {
                            receiver: "4004",
                            sender: "1001",
                            type: 'audio',
                            content: bstr,
                            send_time: send_time
                        }
                        resolve(buf);
                    }).then((buf) => {

                        // startTime = new Date();
                        // Measure.audioMeasure.putDepartureTime(startTime)
                        mqttClient.publish(`audio`, JSON.stringify(buf));
                    })
                }
            }
            else {
                var reader = new FileReader();
                reader.readAsDataURL(blob);

                reader.onloadend = function () {
                    var base64 = reader.result;
                    var base64Audio = base64.split(',').reverse()[0];
                    var bstr = atob(base64Audio); // base64String

                    dbAccess.createColumns('message', data)
                }
            } // end of reader.onloadend ...

        } // end of else ...
    }

    /* ---------------------- 다른 미러 사용자 ---------------------- */
    else {
        switch (type_check) {
            case 'text':
                let content = document.querySelector("#textArea").value;
                buf = {
                    sender: sender,
                    receiver: receiver,
                    content: content,
                    type: 'text',
                    send_time: send_time
                }
                //online user
                if (connect) {
                    outerClient.publish(`${receiver}/connect_msg`, JSON.stringify(buf));
                } else {
                    //서버에 메시지를 저장하는 방법으로 메시지를 보냄
                    outerClient.publish(`server/send/msg`, JSON.stringify(buf));
                }
                break;
            case 'image':
                let img = document.getElementById('msg-img')
                let c = document.createElement('canvas');
                let ctx = c.getContext('2d');
                c.width = 1280;
                c.height = 720;
                ctx.drawImage(img, 0, 0, c.width, c.height);
                let base64SData = c.toDataURL().split(',')[1];
                buf = {
                    receiver: receiver,
                    sender: sender,
                    type: 'image',
                    content: base64SData,
                    send_time: send_time
                    // "type": "image",                      
                }
                // if (PERFORM_EVALUATION) {

                //     let count = 0;
                //     // 사진
                //     const performEvalue = setInterval(function () { // 5초 후 실행
                //         if (count >= loop) {
                //             clearInterval(performEvalue);
                //         }

                //         startTime = new Date().getTime();
                //         mqttClient.publish(`image`, JSON.stringify(buf));

                //         console.log(count + ' : publish');
                //         count++;
                //     }, 1000)


                // }
                if (connect) {
                    console.log("실시간 메시지 전달 : image");
                    outerClient.publish(`${receiver}/connect_msg`, JSON.stringify(buf));


                } else {
                    console.log("논실시간 메시지 전달");
                    //서버에서 메시지를 저장
                    outerClient.publish("server/send/msg", JSON.stringify(buf))

                }
                break;
            case 'audio':
                var reader = new FileReader(); // new_m_record.js에서 녹음한 blob 객체
                var blob = record_obj.getBlob(); // 컨텐츠를 특정 Blob에서 읽어 옴

                reader.readAsDataURL(blob);
                reader.onloadend = function () {
                    var base64 = reader.result; // base64 인코딩 된 스트링 데이터가 result 속성에 담아지게 됩니다.
                    // console.log(`After Audio Base64 : ${base64}`)
                    // var base64Audio = base64.split(',').reverse()[0];
                    var base64Audio = base64.split(',').reverse()[0];
                    console.log(`base64Audio : ${base64Audio}`)

                    new Promise((resolve, reject) => {
                        var bstr = atob(base64Audio); // base64String 
                        var buf = {
                            receiver: receiver,
                            sender: sender,
                            type: 'audio',
                            content: bstr,
                            send_time: send_time
                        }
                        resolve(buf);
                    }).then((buf) => {
                        if (connect) {
                            console.log("실시간 오디오 전달 : audio");
                            outerClient.publish(`${receiver}/connect_msg`, JSON.stringify(buf));
                            // socket.emit('realTime/message', {
                            //     sender: sender,
                            //     receiver: receiver,
                            //     content: bstr,
                            //     type: 'audio',
                            //     send_time: send_time
                            // });
                        } else {
                            console.log("논실시간 메시지 전달");
                            outerClient.publish("server/send/msg", JSON.stringify(buf))
                            // axios({
                            //     url: 'http://192.168.200.171:9000/send/audio', // 통신할 웹문서
                            //     method: 'post', // 통신할 방식
                            //     data: { // 인자로 보낼 데이터
                            //         receiver: receiver,
                            //         sender: sender,
                            //         content: bstr,
                            //         type: 'audio',
                            //         send_time: send_time
                            //     }
                            // }); // end of axios ...
                        }
                    }).catch(() => "audio error")
                }
                break;
        } // end of else ...
    }
})

messageAccess.liClickEvent = liClickEvent

function showTextContent() {
    text_content.style.display = "block";
    image_content.style.display = "none";
    record_content.style.display = "none";
}

function showImageContent() {
    text_content.style.display = "none";
    image_content.style.display = "block";
    record_content.style.display = "none";
}

function showRecordContent() {
    text_content.style.display = "none";
    image_content.style.display = "none";
    record_content.style.display = "block";
}

// Write Mode
function showWrite() {

    // 처음 메시지 창을 띄울 때 text content 부터 보여주기
    if (back_button.style.display == "none") {
        text_label.style.display = "block";
        image_label.style.display = "block";
        record_label.style.display = "block";
        write_button.style.display = "none";
        back_button.style.display = "block";
        text.checked = true;
    }

    hideKeyboard()
    write_button.style.display = "none";
    back_button.style.display = "block";

    // 메시지함 숨기기
    document.getElementById('message_storage_view').style.display = "none";

    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    // var radio = document.getElementsByName("option");

    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        console.log("write mode : text");
        showTextContent();
    }
    else if (sel_type == "image") {
        console.log("write mode : image");
        showImageContent();
    }
    else { // sel_type == "record"
        console.log("write mode : record");
        showRecordContent();
    }
}

// Store Mode
function showStore() {
    hideKeyboard()
    text_label.style.display = "none";
    image_label.style.display = "none";
    record_label.style.display = "none";
    write_button.style.display = "block";
    back_button.style.display = "none";
    document.getElementById('message_storage_view').style.display = "block";
    // 라디오 버튼 체크 확인
    let radio = document.querySelectorAll(".option_radio");
    var sel_type = null;
    for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked == true) sel_type = radio[i].value;
    }

    if (sel_type == "text") {
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
    else if (sel_type == "image") {
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
    else { // sel_type == "record"
        text_content.style.display = "none";
        image_content.style.display = "none";
        record_content.style.display = "none";
    }
}

// radio button
text.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
image.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})
record.addEventListener('change', () => {
    if (write_button.style.display == "none") showWrite(); // Writing Mode
    else showStore(); // Storage Mode
})

function showKeyboard(e) {
    keyboardTarget.setCurrentTarget(e.target.id);
    keyboardTarget.keyboard.style.display = "block";
}

function hideKeyboard() {
    keyboardTarget.setCurrentTarget(null);
    keyboardTarget.keyboard.style.display = "none";
}



module.exports = messageAccess