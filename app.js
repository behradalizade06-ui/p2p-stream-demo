let pc = new RTCPeerConnection();

// When remote stream arrives
pc.ontrack = (event) => {
  document.getElementById("remote").srcObject = event.streams[0];
};

// =====================
// HOST
// =====================
async function startHost() {
  try {
    // Get camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("local").srcObject = stream;

    // Add tracks to connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Encode offer in URL
    const encoded = btoa(JSON.stringify(offer));
    const url = window.location.origin + window.location.pathname + "?offer=" + encoded;

    console.log("Host URL:", url);

    // Generate QR
    const canvas = document.getElementById("qr");
    QRCode.toCanvas(canvas, url, function (error) {
      if (error) console.error(error);
      else console.log("QR generated ✅");
    });

    alert("✅ QR Code ready — scan with phone");

  } catch (err) {
    console.error("Error in startHost:", err);
    alert("Camera error or permission denied");
  }
}

// =====================
// CLIENT
// =====================
async function startClient() {
  try {
    const params = new URLSearchParams(window.location.search);
    const offer = params.get("offer");

    if (!offer) {
      alert("❌ No offer found in URL");
      return;
    }

    // Decode offer
    const decodedOffer = JSON.parse(atob(offer));
    await pc.setRemoteDescription(decodedOffer);

    // Create answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const encodedAnswer = btoa(JSON.stringify(answer));

    console.log("Answer:", encodedAnswer);

    // Show answer to user
    alert("✅ Copy this and send back to Host:\n\n" + encodedAnswer);

  } catch (err) {
    console.error("Error in startClient:", err);
    alert("Connection error");
  }
}
