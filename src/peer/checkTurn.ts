/**
 * A credentials response does not prove that TURN allocations are allowed.
 * Metered can disable credentials when a project reaches its quota:
 * https://www.metered.ca/docs/turn-rest-api/project/index/
 * The Get Credential API documents no quota-specific HTTP status:
 * https://www.metered.ca/docs/turn-rest-api/get-credential/
 * Check for a relay candidate without delaying the meeting or sending media.
 */
export function checkTurn(
  iceServers: RTCIceServer[],
  signal: AbortSignal
): Promise<boolean> {
  return new Promise((resolve) => {
    let peer: RTCPeerConnection | undefined;
    let finished = false;
    const finish = (available: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      if (peer) {
        peer.onicecandidate = null;
        peer.close();
      }
      resolve(available);
    };
    const onAbort = () => finish(false);
    const timer = setTimeout(() => finish(false), 10000);
    signal.addEventListener('abort', onAbort);
    if (signal.aborted) {
      finish(false);
      return;
    }
    try {
      peer = new RTCPeerConnection({ iceServers, iceTransportPolicy: 'relay' });
      peer.onicecandidate = ({ candidate }) => {
        if (!candidate) finish(false);
        else if (candidate.type === 'relay' || / typ relay(?: |$)/.test(candidate.candidate)) {
          finish(true);
        }
      };
      peer.createDataChannel('turn-check');
      const connection = peer;
      connection.createOffer()
        .then((offer) => {
          if (!finished) return connection.setLocalDescription(offer);
        })
        .catch(() => finish(false));
    } catch {
      finish(false);
    }
  });
}
