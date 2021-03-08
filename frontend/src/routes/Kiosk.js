import { useCallback, useEffect, useRef, useState } from 'react';
import * as Video from 'twilio-video/dist/twilio-video';
import socket from './../socket.js';
import { getToken } from './../twilio.js';
import './Kiosk.css';

async function getNewQRCode() {
  const res = await fetch('/api/code');
  return await res.text();
}

function Kiosk({ demo }) {
  const videoElement = useRef(null);
  const [state, setState] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [temperature, setTemperature] = useState(36.2);
  const [maskState, setMaskState] = useState('none');
  const [dispensedMask, setDispensedMask] = useState(false);

  const advance = useCallback(() => {
    setState(s => ((s % 5) + 1));
  }, []);

  useEffect(() => {
    async function setupVideo() {
      try {
        const token = await getToken();
        console.log(token);
        const track = await Video.createLocalVideoTrack();
        videoElement.current.appendChild(track.attach());
        const room = await Video.connect(token, {
          name: 'adiona-feed',
          tracks: [track],
        });

        console.log('Connected to room');

        room.on('participantConnected', participant => {
          console.log(`Participant "${participant.identity}" connected`);
        });
      } catch (error) {
        console.log('Failed to init camera');
        console.error(error);
      }
    }
    setupVideo();
  }, []);

  useEffect(() => {
    async function setupQRCode() {
      setQrCode(await getNewQRCode());
    }
    setupQRCode();
  }, []);

  useEffect(() => {
    const scannedListener = socket.on('scanned', async () => {
      setState((oldState) => oldState === 1 ? 2 : oldState);
      setQrCode(await getNewQRCode());
    });

    const maskListener = socket.on('maskState', (state) => {
      setMaskState(state);
    });

    const advanceListener = socket.on('advance', () => {
      advance();
    });

    return () => {
      socket.off('scanned', scannedListener);
      socket.off('maskState', maskListener);
      socket.off('advance', advanceListener);
    };
  }, [advance]);

  useEffect(() => {
    const interval = setInterval(() => {
      const temp = 36 + Math.random();
      setTemperature(temp.toFixed(1));
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    switch (state) {
      case 2:
        setDispensedMask(false);

        if (demo) {
          setTimeout(() => {
            setState(3);
          }, 3000);
        }
        break;
      case 3:
        setTimeout(() => {
          setState(4);
        }, 1500);
        break;
      case 4:
        setTimeout(() => {
          setState(5);
        }, 3000);
        break;
      case 5:
        socket.emit('openGate');
        setTimeout(() => {
          setState(1);
        }, 3000);
        break;
      default:
        break;
    }
  }, [state, demo]);

  useEffect(() => {
    if (state === 2) {
      switch (maskState) {
        case 'ok':
          setState(3);
          break;
        case 'down':
          break;
        case 'none':
          if (!dispensedMask) {
            setDispensedMask(true);
            socket.emit('dispenseMask');
          }
          break;
        case 'noFace':
          break;
        default:
          break;
      }
    }
  }, [state, maskState, dispensedMask]);

  let displayCode = qrCode.replace(`<path fill="#ffffff" d="M0 0h33v33H0z"/>`, '');
  displayCode = encodeURIComponent(displayCode);
  displayCode = `data:image/svg+xml;utf8,${displayCode}`

  const cardTranslation = (state - 3) * -100;

  return (
    <div className="kiosk-body">
      <div className="kiosk-welcome" onClick={advance}>
        Welcome
      </div>
      <div className="kiosk-cam-box" ref={videoElement}>

      </div>

      <div className="kiosk-slider-container">
        <div className="kiosk-slider" style={{ transform: `translateX(${cardTranslation}vw)` }}>
          <div className="kiosk-module">
            <div className="kiosk-instructions">
              First, Scan Student ID on the NFC Reader on the right or Scan QR Code below
            </div>

            <div className="kiosk-icon-row">
              <div className="kiosk-icon-container kiosk-left-icon">
                <img className="kiosk-qr-code" src={displayCode} alt="" />
              </div>
              <div className="kiosk-icon-container">
                <svg className="kiosk-qr-code"viewBox="0 0 448 512"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/></svg>
              </div>
            </div>
          </div>

          <div className="kiosk-module">
            <div className="kiosk-instructions">
              Please Put On a Mask!
              <span>Feel free to take one from under the screen. Make sure to cover your nose and mouth</span>
            </div>

            <div className="kiosk-icon-row">
              <div className="kiosk-icon-container kiosk-left-icon">
                <svg className="kiosk-qr-code" style={{ transform: 'rotate(90deg)' }} viewBox="0 0 448 512"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/></svg>
              </div>
              <div className="kiosk-icon-container">
                <svg className="kiosk-qr-code" style={{ transform: 'translate(-40px, -20px)' }} version="1.1" x="0px" y="0px" viewBox="0 0 300 300">
                  <g>
                    <g>
                      <path d="M149.5,281.4c-0.1,0-0.2,0-0.3,0c-1.9-0.1-3.4-1.8-3.2-3.7c0-0.1,0.6-8,0-25.2c-0.5-14.2-2.1-16-28.4-16
                        c-5.5,0-11.7-2.2-16.5-5.8l-0.5-0.4l-0.3-0.5c-0.4-0.6-9.4-14.4-18.6-34.6c-15.6-18.9-8-35-7.2-36.7c1.6-3.4,3.3-6.7,5-10
                        c2.5-4.7,4.8-9.2,6.4-13.3c0.7-1.9,1.4-3.4,2-4.8c0.9-2.1,1.6-3.8,2.3-6c3-10,4.2-18.3,4.2-18.4l0-0.2c6.3-34.4,28-49.6,45-56.3
                        c17.2-6.8,33-6.5,35.4-6.4c4-0.4,43.1-3.1,75.8,28.4c2,1.8,30.3,27.4,31.1,69c0.8,43.4-14.6,62.3-39.6,78.6l-0.3,0.2l-0.3,0.1
                        c-0.1,0.1-14.9,6.6-14.9,19v31.1c0,1.9-1.6,3.5-3.5,3.5s-3.5-1.6-3.5-3.5v-31.1c0-16.1,16.3-24.1,18.8-25.3
                        c23.5-15.4,36.9-32.2,36.2-72.5c-0.7-39.1-28.4-63.6-28.7-63.9l-0.1-0.1C214.4,46.1,175.8,50,175.4,50l-0.3,0l-0.3,0
                        c-0.2,0-16-0.8-32.9,6c-22.3,8.9-35.9,26-40.5,50.9c-0.1,1-1.3,9.4-4.4,19.4c-0.8,2.5-1.6,4.5-2.6,6.7c-0.6,1.4-1.2,2.8-1.9,4.6
                        c-1.7,4.5-4.2,9.2-6.8,14.1c-1.7,3.2-3.4,6.5-4.9,9.7l-0.1,0.2c-0.3,0.5-6.7,13.4,6.6,29.3l0.3,0.4l0.2,0.4
                        c8.1,17.8,16.2,30.8,18,33.6c3.6,2.5,7.9,4,11.8,4c26.2,0,34.7,1.8,35.4,22.8c0.6,17.7,0,25.6,0,26
                        C152.9,280,151.4,281.4,149.5,281.4z"/>
                    </g>
                    <path d="M146.2,240.5l-1.6,0c-1,0-24-0.6-37.6-6.5c-13.7-5.9-23.6-33.9-25.4-39.1c-2-2.8-11-16.2-9.1-29.2
                      c0.9-6.2,4.1-11.3,9.4-15.3l0.9-0.6l1.1-0.1c0.7,0,66.6-3.3,104.5-13.4c3-1.1,36-12.6,48,8c0.7,1.1,3.5,5.8,2.1,13
                      c-1.9,9.9-10.5,19.7-25.6,29.2c-41,25.7-65.3,52.5-65.6,52.8L146.2,240.5z M85.3,156.6c-3.3,2.7-5.3,6-5.8,10
                      c-1.7,11.4,8,24.4,8.1,24.5l0.3,0.5l0.2,0.6c2.8,8.4,12,31.3,21.6,35.4c10.5,4.5,28.2,5.6,33.5,5.9c5.3-5.6,28.5-29.3,65.9-52.8
                      c16.5-10.4,21.3-18.9,22.4-24.3c1-5-0.9-8-1-8.1l-0.2-0.3c-9.2-16.2-39.4-5.1-39.7-5l-0.3,0.1C154,152.7,94.4,156.1,85.3,156.6z"/>
                    <path d="M182.1,206.1c-1.5,0-2.9-1-3.3-2.4l-17.5-55.1c-0.6-1.8,0.4-3.8,2.3-4.4c1.8-0.6,3.8,0.4,4.4,2.3l17.5,55.1
                      c0.6,1.8-0.4,3.8-2.3,4.4C182.8,206.1,182.5,206.1,182.1,206.1z"/>
                    <path d="M87.4,201.9c-1.5,0-2.8-0.9-3.3-2.4c-0.6-1.8,0.4-3.8,2.2-4.4l55.4-18.5c1.8-0.6,3.8,0.4,4.4,2.2
                      c0.6,1.8-0.4,3.8-2.2,4.4l-55.4,18.5C88.2,201.8,87.8,201.9,87.4,201.9z"/>
                    <path d="M96.2,221.7c-1.4,0-2.7-0.9-3.3-2.3c-0.7-1.8,0.2-3.8,2-4.5l53.6-20.3c1.8-0.7,3.8,0.2,4.5,2
                      c0.7,1.8-0.2,3.8-2,4.5l-53.6,20.3C97,221.7,96.6,221.7,96.2,221.7z"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="kiosk-module">
            <div className="kiosk-instructions">
              Thanks for wearing a mask! Let's take your temperature
              <span>Please stand still until you hear a beep.</span>
            </div>

            <div className="kiosk-icon-row">
              <div className="kiosk-icon-container">
                <svg className="kiosk-qr-code" style={{ transform: 'scale(85%)' }} version="1.1" id="_x31_-outline-expand" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 64 64">
                  <path d="M38,35h5c0.329,0,0.638-0.162,0.824-0.434c0.187-0.271,0.228-0.617,0.109-0.925l-4.935-12.829
                    c-0.028-2.807-0.68-5.574-1.893-8.077C40.605,10.892,43,7.223,43,3c0-0.552-0.447-1-1-1H20C9.523,2,1,10.523,1,21v13
                    c0,0.049,0.021,0.092,0.028,0.139L1.01,34.142L3,48.071V61c0,0.552,0.447,1,1,1h19c0.553,0,1-0.448,1-1V51h13c0.553,0,1-0.448,1-1
                    V35z M3,21c0-9.374,7.626-17,17-17h20.944c-0.499,4.494-4.319,8-8.944,8H12c-0.553,0-1,0.448-1,1v4.101C8.721,17.565,7,19.585,7,22
                    c0,2.395,1.692,4.402,3.944,4.888C10.507,30.33,7.56,33,4,33H3V21z M37,33c-0.553,0-1,0.448-1,1v8h-3c-1.103,0-2-0.897-2-2h-2
                    c0,2.206,1.794,4,4,4h3v5H23c-0.553,0-1,0.448-1,1v10H5V48c0-0.047-0.003-0.095-0.01-0.142L3.153,35H4c4.963,0,9-4.038,9-9
                    c0-0.552-0.447-1-1-1c-1.654,0-3-1.346-3-3s1.346-3,3-3c0.553,0,1-0.448,1-1v-4h19c1.133,0,2.226-0.173,3.255-0.492
                    C36.396,15.822,37,18.393,37,21c0,0.123,0.022,0.245,0.066,0.359L41.544,33H37z"/>
                  <path d="M29,24.759c-1.334,0-2.59-0.521-3.535-1.466l-1.414,1.414c1.322,1.323,3.08,2.052,4.949,2.052s3.627-0.729,4.949-2.052
                    l-1.414-1.414C31.59,24.238,30.334,24.759,29,24.759z"/>
                  <path d="M61.868,22.504l-4-7C57.69,15.192,57.358,15,57,15H44c-0.553,0-1,0.448-1,1v8c0,0.552,0.447,1,1,1h4.132l0.877,6.142
                    C49.08,31.634,49.502,32,50,32h2.692l1.331,6.209C54.121,38.67,54.528,39,55,39h6c0.553,0,1-0.448,1-1V23
                    C62,22.826,61.954,22.655,61.868,22.504z M50.867,30l-0.714-5h1.038l1.072,5H50.867z M60,37h-4.191l-2.831-13.209
                    C52.879,23.33,52.472,23,52,23h-7v-6h11.42L60,23.266V37z"/>
                  <rect x="42.172" y="7" transform="matrix(0.7071 -0.7071 0.7071 0.7071 7.5233 34.163)" width="5.657" height="2"/>
                  <rect x="44.807" y="11" transform="matrix(0.9285 -0.3714 0.3714 0.9285 -1.0593 18.4993)" width="5.385" height="2"/>
                  <path d="M54,47c-4.411,0-8,3.589-8,8s3.589,8,8,8s8-3.589,8-8S58.411,47,54,47z M54,61c-3.309,0-6-2.691-6-6s2.691-6,6-6
                    s6,2.691,6,6S57.309,61,54,61z"/>
                  <path d="M53,55.586l-1.293-1.293l-1.414,1.414l2,2C52.488,57.902,52.744,58,53,58s0.512-0.098,0.707-0.293l5-5l-1.414-1.414
                    L53,55.586z"/>
                  <rect x="57" y="41" width="2" height="2"/>
                  <rect x="57" y="45" width="2" height="2"/>
                  <rect x="42" y="54" width="2" height="2"/>
                  <rect x="38" y="54" width="2" height="2"/>
                  <rect x="34" y="54" width="2" height="2"/>
                  <rect x="30" y="54" width="2" height="2"/>
                  <rect x="26" y="54" width="2" height="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="kiosk-module">
            <div className="kiosk-instructions">
              Your Temperature is {temperature}°C
            </div>

            <div className="kiosk-icon-row">
              <div className="kiosk-icon-container">
                <svg className="kiosk-qr-code" style={{ transform: 'scale(80%)', fill: 'lime' }} version="1.1" x="0px" y="0px" viewBox="0 0 80.588 61.158">
                  <path d="M29.658,61.157c-1.238,0-2.427-0.491-3.305-1.369L1.37,34.808c-1.826-1.825-1.826-4.785,0-6.611
                    c1.825-1.826,4.786-1.827,6.611,0l21.485,21.481L72.426,1.561c1.719-1.924,4.674-2.094,6.601-0.374
                    c1.926,1.72,2.094,4.675,0.374,6.601L33.145,59.595c-0.856,0.959-2.07,1.523-3.355,1.56C29.746,61.156,29.702,61.157,29.658,61.157z
                    "/>
                </svg>
              </div>
            </div>
          </div>

          <div className="kiosk-module">
            <div className="kiosk-instructions">
              Please get some sanitizer below and you're all good to go!
            </div>

            <div className="kiosk-icon-row">
              <div className="kiosk-icon-container kiosk-left-icon">
                <svg className="kiosk-qr-code" style={{ transform: 'rotate(45deg)' }} viewBox="0 0 448 512"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Kiosk;
