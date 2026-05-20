let pc = new RTCPeerConnection();

pc.ontrack = (event) => {
  document.getElementById("remote").srcObject = event.streams[0];
};

async function startHost() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById("local").srcObject = stream;

  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  let encoded = btoa(JSON.stringify(offer));
  let url = window.location.origin + window.location.pathname + "?offer=" + encoded;

  QRCode.toCanvas(document.getElementById("qr"), url);

  alert("Scan QR with phone");
}

async function startClient() {
  let params = new URLSearchParams(window.location.search);
  let offer = params.get("offer");

  if (!offer) {
    alert("No offer found in URL");
    return;
  }

  await pc.setRemoteDescription(JSON.parse(atob(offer)));

  let answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  let encodedAnswer = btoa(JSON.stringify(answer));

  alert("Send this back to host:\n\n" + encodedAnswer);
}
