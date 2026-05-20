let pc = new RTCPeerConnection();

// When remote stream arrives
pc.ontrack = (event) => {
  document.getElementById("remote").srcObject = event.streams[0];
};

// =====================
// HOST (Tablet)
// =====================
async function startHost() {
  try {
    // ✅ Share SCREEN (not camera)
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

    document.getElementById("local").srcObject = stream;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const encoded = btoa(JSON.stringify(offer));
    const url = window.location.origin + window.location.pathname + "?offer=" + encoded;

    // ✅ Generate QR
    QRCode.toCanvas(document.getElementById("qr"), url);

    console.log("QR created ✅");

    alert("Scan QR with phone");

  } catch (err) {
    console.error("Host error:", err);
    alert("Screen sharing failed");
  }
}

// =====================
// CLIENT (Phone)
// =====================
async function startClient() {
  try {
    const params = new URLSearchParams(window.location.search);
    const offer = params.get("offer");

    if (!offer) {
      alert("No offer found");
      return;
    }

    const decoded = JSON.parse(atob(offer));
    await pc.setRemoteDescription(decoded);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const encodedAnswer = btoa(JSON.stringify(answer));

    alert("Copy this and send to host:\n\n" + encodedAnswer);

  } catch (err) {
    console.error("Client error:", err);
    alert("Connection failed");
  }
}
