const mqtt = require('mqtt')
const moment = require('moment')
const options = {  //broker 연동 위한 옵션(브로커 IP 및 포트번호)
  host: '192.168.200.171',
  port: 1883
};
mqttClient = mqtt.connect(options);

mqttClient.publish(`text`, "엄마 송연이에요. 지금 경미네 집인데 여기서 자고 가려고요. 먼저 주무세요.")
mqttClient.publish(`text`, "송연아 안돼. 지금 당장 집으로 들어와. 너 그저께도 안 들어왔잖아. 보고싶다")
mqttClient.publish(`text`, "Electron을 이용한 새로운 IoT 가전 장치, 저희가 만들었어요 교수님 나중에 한 번 보러 오세요")
mqttClient.publish(`text`, "애플 워치 친구가 샀던데 너무 멋지더라. 아니 사달라는 말은 아니고, 그냥 그렇다고")
mqttClient.publish(`text`, "언니는 일본에 잘 도착했어. 한국을 떠난지 하루밖에 안됐는데 벌써 그립지는 않고 여기 재밌네")
mqttClient.publish(`text`, "채원아 오늘 아이디어 회의 한다했잖아 10시인데 왜 아직도 안와 너 혼날래?")
mqttClient.publish(`text`, "유진아 집에 가고싶어? 넌 이미 집이잖아. 사실 내가 집에 가고싶어, 보내줘 집으로 너가 와 여기로")
mqttClient.publish(`text`, "2023년 새해가 하루가 남았어 이번년도는 어땠니? 나는 많은 것을 이뤘어 너는 아니지 메롱")
mqttClient.publish(`text`, "발표 연습 한 번만 들어줘. 본 작품은 CoMirror들이 연결되는 네트워크를 구성하여 사용자들이 다른 CoMirror 사용자들과 대화하고 정보를 공유하는 서버 클라이언트 플랫폼 기술을 설계 구현하였다. 어때?")
mqttClient.publish(`text`, "내일 모니터랑 아크릴판, 미러필름, 블루투스 스피커, 마이크, 카메라 가지고 와야해 알았지?")
