import { useEffect, useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faHeadSideMask, faPumpSoap, faUserTimes } from '@fortawesome/free-solid-svg-icons'
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.js';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { icon } from 'leaflet';
import * as Video from 'twilio-video/dist/twilio-video';
import socket from './../socket.js';
import './AdminDashboard.css';
import markerImage from './../marker.png';
import { getToken } from './../twilio.js';

const locations = [
  [-37.91149,145.132768],
  [-37.911606,145.133351],
  [-37.9120841,145.132651],
  [-37.9121429,145.1330628],
  [-37.913910,145.132157], // LTB
];

function AdminDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const videoElement = useRef(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const markerClick = useCallback(() => {
    setModalOpen(true);
  }, []);

  const openGate = useCallback(() => {
    socket.emit('openGate');
  }, []);

  useEffect(() => {
    async function setupVideo() {
      try {
        const token = await getToken();
        console.log(token);
        const room = await Video.connect(token, {
          name: 'adiona-feed',
          audio: false,
          video: false,
        });

        console.log('Dashboard connected to room');

        room.on('participantConnected', participant => {
          console.log(`Participant "${participant.identity}" connected`);
        
          participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
              const track = publication.track;
              videoElement.current.appendChild(track.attach());
            }
          });
        
          participant.on('trackSubscribed', track => {
            videoElement.current.appendChild(track.attach());
          });
        });
        
        room.participants.forEach(participant => {
          participant.tracks.forEach(publication => {
            if (publication.track) {
              videoElement.current.appendChild(publication.track.attach());
            }
          });
        
          participant.on('trackSubscribed', track => {
            videoElement.current.appendChild(track.attach());
          });
        });        
      } catch (error) {
        console.log('Failed to init camera');
        console.error(error);
      }
    }
    setupVideo();
  }, []);

  return (
    <div className="dashboard-body">
      <div className={'modal-window' + (modalOpen ? ' open' : '')}>
        <div>
          <div className="modal-close" onClick={closeModal}>Close</div>
          <h1>Checkin Station</h1>
          <div className="dashboard-modal-body">
            <div className="dashboard-small-bar">
              <div className="dashboard-small-stat">
                <FontAwesomeIcon className="dashboard-small-icon" size="1x" icon={faUsers} />
                40
              </div>
              <span className="dashboard-small-stat" style={{ background: 'linear-gradient(180deg, white 0%, white 50%, #AFD98F 50%, #AFD98F 100%)'}}>
                <FontAwesomeIcon className="dashboard-small-icon" size="1x" icon={faHeadSideMask} />
                50%
              </span>
              <span className="dashboard-small-stat" style={{ background: 'linear-gradient(180deg, white 0%, white 10%, #AFD98F 10%, #AFD98F 100%)'}}>
                <FontAwesomeIcon className="dashboard-small-icon" size="1x" icon={faUserTimes} />
                95%
              </span>
            </div>
            <div className="dashboard-cam-box" ref={videoElement} />
            <div className="dashboard-open-gate" onClick={openGate}>
              OPEN GATE
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-bar">
        <div className="dashboard-stat">
          <span className="dashboard-stat-top">
            <FontAwesomeIcon className="dashboard-icon" size="1x" icon={faUsers} />
            40
          </span>
          <span>people checked in</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-top">
            <FontAwesomeIcon className="dashboard-icon" size="1x" icon={faHeadSideMask} />
            3
          </span>
          <span>stations out of masks</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-top">
            <FontAwesomeIcon className="dashboard-icon" size="1x" icon={faPumpSoap} />
            1
          </span>
          <span>stations out of sanitiser</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-top">
            <FontAwesomeIcon className="dashboard-icon" size="1x" icon={faUserTimes} />
            0
          </span>
          <span>stations offline</span>
        </div>
      </div>

      <div className="dashboard-main">
        <MapContainer className="dashboard-map" center={[-37.911, 145.133]} zoom={18}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(l => (
            <Marker key={l} position={l} eventHandlers={{ click: markerClick }} icon={icon({
              iconUrl: markerImage,
              iconSize: [25, 41],
            })} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default AdminDashboard;
