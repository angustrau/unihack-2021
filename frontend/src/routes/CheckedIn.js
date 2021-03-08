import './CheckedIn.css';

function CheckedIn() {
  return (
    <div className="checkedin-body">
      <div className="checkedin-card">
        <div className="checkedin-title">
          Thank You
        </div>
        <svg style={{ transform: 'scale(40%)', fill: 'lime' }} version="1.1" x="0px" y="0px" viewBox="0 0 80.588 61.158">
          <path d="M29.658,61.157c-1.238,0-2.427-0.491-3.305-1.369L1.37,34.808c-1.826-1.825-1.826-4.785,0-6.611
            c1.825-1.826,4.786-1.827,6.611,0l21.485,21.481L72.426,1.561c1.719-1.924,4.674-2.094,6.601-0.374
            c1.926,1.72,2.094,4.675,0.374,6.601L33.145,59.595c-0.856,0.959-2.07,1.523-3.355,1.56C29.746,61.156,29.702,61.157,29.658,61.157z
            "/>
        </svg>
        <div className="checkedin-text">
          You've successfully checked in.
        </div>
      </div>
    </div>
  );
}

export default CheckedIn;
