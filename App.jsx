import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [viewRole, setViewRole] = useState('selection'); 
  const [activeTab, setActiveTab] = useState('registration');
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null); 
  const [dashboardStats, setDashboardStats] = useState({ total: 150, occupied: 0, available: 150 });

  useEffect(() => {
    if (viewRole === 'admin') {
      fetch('http://127.0.0.1:5000/get_tickets')
        .then(res => res.json())
        .then(data => {
          setTickets(data);
          
          const allocated = data.filter(t => 
            !t.category && 
            !t.issue_type && 
            t.approval_status === 'approved'
          ).length;
          
          setDashboardStats(prev => ({ 
            ...prev, 
            occupied: allocated, 
            available: prev.total - allocated 
          }));
        })
        .catch(err => console.log("Waiting for backend..."));
    }
  }, [viewRole, tickets]);

  const handleRegistrationDecision = (studentId, decision) => {
    let roomDetails = {};
    
    if (decision === 'approved') {
      const block = prompt("Enter Block Name (e.g., B2):");
      const room = prompt("Enter Room Number (e.g., 514):");
      
      if (!block || !room) {
        alert("Action Cancelled: Block and Room are required for approval.");
        return;
      }
      roomDetails = { block, room };
    }

    fetch(`http://127.0.0.1:5000/registration_decision/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        decision: decision,
        ...roomDetails 
      }) 
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        setStatus(`Registration ${decision}! ✅`);
        setTickets(prev => prev.map(t => 
          t.student_id === studentId 
            ? { ...t, approval_status: decision, block: roomDetails.block || t.block, room: roomDetails.room || t.room } 
            : t
        ));
        setTimeout(() => setStatus(""), 3000);
      }
    })
    .catch(err => setStatus("Error processing decision"));
  };

  const handleUpdateStatus = (ticketId, newStatus) => {
    fetch(`http://127.0.0.1:5000/update_ticket/${ticketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        setStatus("Item Resolved! ✅");
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        setSelectedTicket(null);
        setTimeout(() => setStatus(""), 3000);
      }
    })
    .catch(err => setStatus("Error updating status"));
  };

  const handleAction = (endpoint, body) => {
    fetch(`http://127.0.0.1:5000/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      setStatus(data.message || `Success`);
      setTimeout(() => setStatus(""), 3000);
    })
    .catch(err => setStatus("Error: Backend not running!"));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "warden123") {
      setViewRole('admin');
      setActiveTab('reg_list');
      setPassword("");
      setStatus("");
    } else {
      setStatus("Access Denied: Incorrect Password");
    }
  };

  return (
    <div className="container">
      {viewRole === 'selection' && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h1>Welcome to PDPU Hostel Portal</h1>
          <p>Please select your role to continue</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
            <div className="card" style={{ cursor: 'pointer', width: '250px' }} onClick={() => { setViewRole('student'); setActiveTab('registration'); }}>
              <h2 style={{ fontSize: '3rem' }}>🎓</h2>
              <h3>Student</h3>
              <p>Register or raise issues</p>
            </div>
            <div className="card" style={{ cursor: 'pointer', width: '250px' }} onClick={() => setViewRole('warden_login')}>
              <h2 style={{ fontSize: '3rem' }}>🔑</h2>
              <h3>Warden</h3>
              <p>Manage hostel & tickets</p>
            </div>
          </div>
        </div>
      )}

      {viewRole === 'warden_login' && (
        <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>
          <h3>Warden Authentication</h3>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            <button type="submit" className="action-btn">Login</button>
            <button type="button" className="action-btn" style={{ background: '#6c757d', marginTop: '10px' }} onClick={() => setViewRole('selection')}>Back</button>
          </form>
        </div>
      )}

      {(viewRole === 'student' || viewRole === 'admin') && (
        <>
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <button className="action-btn" style={{ width: 'auto', padding: '10px 20px', background: '#dc3545' }} onClick={() => { setViewRole('selection'); setStatus(""); setSelectedTicket(null); }}>Logout</button>
          </div>

          <h1>{viewRole === 'student' ? 'PDPU Hostel Portal' : 'Warden Control Room'}</h1>

          {viewRole === 'admin' && (
            <div className="card" style={{ maxWidth: '950px', width: '95%' }}>
              <div className="nav-links" style={{ marginBottom: '20px' }}>
                <button onClick={() => {setActiveTab('reg_list'); setSelectedTicket(null);}}>Registrations</button>
                <button onClick={() => {setActiveTab('reg_archive'); setSelectedTicket(null);}}>📁 Register Archive</button>
                <button onClick={() => {setActiveTab('maint_list'); setSelectedTicket(null);}}>Maintenance</button>
                <button onClick={() => {setActiveTab('comp_list'); setSelectedTicket(null);}}>Complaints</button>
                <button style={{background: '#28a745', color: 'white'}} onClick={() => {setActiveTab('solved_list'); setSelectedTicket(null);}}>✅ Solved Items</button>
              </div>

              {selectedTicket && (
                <div className="card" style={{ background: '#1e1e1e', border: '1px solid #444', marginBottom: '20px', textAlign: 'left', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{margin:0, color: '#fff'}}>🔍 Details: {selectedTicket.name || selectedTicket.id}</h3>
                    <button className="action-btn" style={{width:'auto', margin:0, background:'#dc3545', padding: '5px 15px'}} onClick={() => setSelectedTicket(null)}>Close</button>
                  </div>
                  <hr style={{borderColor: '#333', margin: '15px 0'}}/>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', color: '#eee', fontSize: '14px'}}>
                    <p><strong>ID:</strong> {selectedTicket.student_id || selectedTicket.id}</p>
                    <p><strong>Status:</strong> {selectedTicket.approval_status || selectedTicket.status}</p>
                    {selectedTicket.block && <p><strong>Assigned Room:</strong> {selectedTicket.block}-{selectedTicket.room}</p>}
                    {selectedTicket.preference && <p><strong>Preference:</strong> {selectedTicket.preference}</p>}
                    {selectedTicket.contact && <p><strong>Contact:</strong> {selectedTicket.contact}</p>}
                  </div>
                </div>
              )}

              {activeTab === 'reg_list' && (
                <div>
                  <div className="row" style={{ marginBottom: '20px' }}>
                    <div className="status-box"><h2>{dashboardStats.total}</h2><p>Total Capacity</p></div>
                    <div className="status-box" style={{borderColor: '#dc3545'}}><h2>{dashboardStats.occupied}</h2><p>Allocated</p></div>
                    <div className="status-box" style={{borderColor: '#28a745'}}><h2>{dashboardStats.available}</h2><p>Empty Rooms</p></div>
                  </div>
                  <h3>Pending Registrations</h3>
                  <table className="admin-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Preference</th><th>Action</th></tr></thead>
                    <tbody>
                      {/* الفلترة لعرض الطلبات المعلقة فقط */}
                      {tickets.filter(t => !t.category && !t.issue_type && (!t.approval_status || t.approval_status === 'pending')).map(t => (
                        <tr key={t.id}>
                          <td>{t.student_id}</td><td>{t.name}</td><td>{t.preference}</td>
                          <td>
                            <div style={{display:'flex', gap:'5px'}}>
                              <button className="action-btn" style={{background:'#28a745', marginTop:0, padding:'2px 8px'}} onClick={() => handleRegistrationDecision(t.student_id, 'approved')}>Approve</button>
                              <button className="action-btn" style={{background:'#dc3545', marginTop:0, padding:'2px 8px'}} onClick={() => handleRegistrationDecision(t.student_id, 'rejected')}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reg_archive' && (
                <div>
                  <h3>Processed Registrations</h3>
                  <table className="admin-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Room/Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {/* عرض الطلبات المقبولة أو المرفوضة فقط */}
                      {tickets.filter(t => !t.category && !t.issue_type && (t.approval_status === 'approved' || t.approval_status === 'rejected')).map(t => (
                        <tr key={t.id} style={{opacity: 0.8}}>
                          <td>{t.student_id}</td>
                          <td>{t.name}</td>
                          <td>
                            {t.approval_status === 'approved' ? (
                              <span style={{color: '#28a745'}}>✅ {t.block}-{t.room}</span>
                            ) : (
                              <span style={{color: '#dc3545'}}>❌ Rejected</span>
                            )}
                          </td>
                          <td><button className="action-btn" style={{marginTop:0, padding:'5px'}} onClick={() => setSelectedTicket(t)}>View Full Data</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'maint_list' && (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Category</th><th>Room</th><th>Action</th></tr></thead>
                  <tbody>
                    {tickets.filter(t => t.category && t.status !== 'solved').map(t => (
                      <tr key={t.id}>
                        <td>{t.id}</td><td>{t.category}</td><td>{t.block}-{t.room}</td>
                        <td>
                          <button className="action-btn" style={{padding: '5px', background: '#28a745', marginTop:0}} onClick={() => handleUpdateStatus(t.id, 'solved')}>✔ Done</button>
                          <button className="action-btn" style={{padding: '5px', marginTop:0, marginLeft: '5px'}} onClick={() => setSelectedTicket(t)}>Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'comp_list' && (
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Subject</th><th>Type</th><th>Action</th></tr></thead>
                  <tbody>
                    {tickets.filter(t => t.issue_type && t.status !== 'solved').map(t => (
                      <tr key={t.id}>
                        <td>{t.student_id}</td><td>{t.subject}</td><td>{t.issue_type}</td>
                        <td>
                          <button className="action-btn" style={{padding: '5px', background: '#28a745', marginTop:0}} onClick={() => handleUpdateStatus(t.id, 'solved')}>✔ Done</button>
                          <button className="action-btn" style={{padding: '5px', marginTop:0, marginLeft: '5px'}} onClick={() => setSelectedTicket(t)}>Read</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'solved_list' && (
                <table className="admin-table">
                  <thead><tr><th>Type</th><th>ID</th><th>Details</th><th>Action</th></tr></thead>
                  <tbody>
                    {tickets.filter(t => t.status === 'solved').map(t => (
                      <tr key={t.id} style={{opacity: 0.7}}>
                        <td>{t.category ? "🛠 Maint" : "📩 Complaint"}</td><td>{t.id}</td><td>{t.category || t.subject}</td>
                        <td><button className="action-btn" style={{marginTop:0, padding:'5px'}} onClick={() => setSelectedTicket(t)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {viewRole === 'student' && (
            <>
              <div className="nav-links">
                <button onClick={() => setActiveTab('registration')}>Registration</button>
                <button onClick={() => setActiveTab('maintenance')}>Maintenance</button>
                <button onClick={() => setActiveTab('complaints')}>Complaints</button>
              </div>
              <div className="card" style={{marginTop: '20px'}}>
                {activeTab === 'registration' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleAction('register', Object.fromEntries(new FormData(e.target))); }}>
                    <h3>Student Registration</h3>
                    <input type="text" name="student_id" placeholder="Student ID" required className="input-field" />
                    <input type="text" name="name" placeholder="Full Name" required className="input-field" />
                    <div className="row">
                      <select name="gender" className="input-field" required><option value="">Gender</option><option value="M">Male</option><option value="F">Female</option></select>
                      <select name="year" className="input-field" required><option value="">Year</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option></select>
                    </div>
                    <input type="text" name="receipt_no" placeholder="Fees Receipt Number" required className="input-field" />
                    <select name="preference" className="input-field" required>
                      <option value="">Preference</option><option value="AC_three">AC - 3 Sharing</option><option value="NonAC_Double">Non-AC - 2 Sharing</option>
                    </select>
                    <input type="tel" name="emergency" placeholder="Parent's Contact" required className="input-field" />
                    <button type="submit" className="action-btn">Register & Request Room</button>
                  </form>
                )}
                {activeTab === 'maintenance' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleAction('maintenance', Object.fromEntries(new FormData(e.target))); }}>
                    <h3>Maintenance Request</h3>
                    <input type="text" name="name" placeholder="Name" required className="input-field" />
                    <div className="row">
                      <input type="text" name="block" placeholder="Block" required className="input-field" />
                      <input type="text" name="room" placeholder="Room" required className="input-field" />
                    </div>
                    <select name="category" className="input-field" required>
                      <option value="">Category</option><option value="Electrical">Electrical</option><option value="HVAC">AC/HVAC</option><option value="Carpentry">Carpentry</option><option value="Plumbing">Plumbing</option>
                    </select>
                    <textarea name="description" placeholder="Issue Description" required className="input-field"></textarea>
                    <input type="tel" name="contact" placeholder="Your Contact" required className="input-field" />
                    <button type="submit" className="action-btn">Submit Request</button>
                  </form>
                )}
                {activeTab === 'complaints' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleAction('complaint', Object.fromEntries(new FormData(e.target))); }}>
                    <h3>Complaint Portal</h3>
                    <input type="text" name="student_id" placeholder="Student ID" required className="input-field" />
                    <div className="row">
                      <input type="text" name="block" placeholder="Block" required className="input-field" />
                      <input type="text" name="room" placeholder="Room" required className="input-field" />
                    </div>
                    <input type="text" name="subject" placeholder="Subject" required className="input-field" />
                    <select name="issue_type" className="input-field" required>
                      <option value="">Issue Type</option><option value="Food">Food</option><option value="Internet">Internet</option><option value="Security">Security</option>
                    </select>
                    <textarea name="description" placeholder="Feedback/Details" required className="input-field"></textarea>
                    <button type="submit" className="action-btn">Submit Complaint</button>
                  </form>
                )}
              </div>
            </>
          )}
        </>
      )}
      {status && <div className="status-box" style={{ marginTop: '15px' }}>{status}</div>}
    </div>
  );
}

export default App;