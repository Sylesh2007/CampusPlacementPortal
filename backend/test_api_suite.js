const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('====================================================');
  console.log('RUNNING FULL REST API & MONGODB ATLAS TEST SUITE');
  console.log('====================================================\n');

  try {
    // 1. Root API Check
    console.log('1. Testing Root API Endpoint GET / ...');
    const rootRes = await fetch(`${BASE_URL}/`);
    assert.strictEqual(rootRes.status, 200);
    const rootData = await rootRes.json();
    console.log('   ✓ Status 200 OK - Backend Status:', rootData.status);

    // 2. Authentication: Student Login
    console.log('\n2. Testing POST /login (Student: alex@campus.edu) ...');
    const stuLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@campus.edu', password: 'studentpassword123' }),
    });
    assert.strictEqual(stuLoginRes.status, 200);
    const stuLoginData = await stuLoginRes.json();
    const studentToken = stuLoginData.token;
    console.log('   ✓ Login Successful! Student Token generated:', studentToken ? 'YES' : 'NO');
    console.log('   ✓ Role verified:', stuLoginData.user.role);

    // 3. Authentication: Company Login
    console.log('\n3. Testing POST /login (Company: hr@google.com) ...');
    const compLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@google.com', password: 'companypassword123' }),
    });
    assert.strictEqual(compLoginRes.status, 200);
    const compLoginData = await compLoginRes.json();
    const companyToken = compLoginData.token;
    console.log('   ✓ Login Successful! Company Token generated:', companyToken ? 'YES' : 'NO');
    console.log('   ✓ Role verified:', compLoginData.user.role);

    // 4. Authentication: Admin Login
    console.log('\n4. Testing POST /login (Admin: admin@campus.edu) ...');
    const adminLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campus.edu', password: 'adminpassword123' }),
    });
    assert.strictEqual(adminLoginRes.status, 200);
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    console.log('   ✓ Login Successful! Admin Token generated:', adminToken ? 'YES' : 'NO');
    console.log('   ✓ Role verified:', adminLoginData.user.role);

    // 5. Companies: GET /companies
    console.log('\n5. Testing GET /companies ...');
    const getCompRes = await fetch(`${BASE_URL}/companies`);
    assert.strictEqual(getCompRes.status, 200);
    const getCompData = await getCompRes.json();
    console.log(`   ✓ Retrieved ${getCompData.count} companies from MongoDB Atlas.`);

    // 6. Companies: POST /companies (Admin)
    const testCompId = `CMPTEST${Date.now().toString().slice(-4)}`;
    console.log(`\n6. Testing POST /companies (Adding ${testCompId}) ...`);
    const addCompRes = await fetch(`${BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        companyId: testCompId,
        companyName: 'Qualcomm India',
        location: 'Hyderabad',
        website: 'https://qualcomm.com',
        HRName: 'Anil Kumar',
        packageOffered: '19.5 LPA',
        eligibilityCriteria: 'CGPA >= 7.5, Embedded Systems / VLSI / CSE',
      }),
    });
    assert.strictEqual(addCompRes.status, 201);
    const addCompData = await addCompRes.json();
    console.log('   ✓ Company Added successfully:', addCompData.data.companyName);

    // 7. Companies: PUT /companies/:id (Admin update)
    console.log(`\n7. Testing PUT /companies/${testCompId} ...`);
    const putCompRes = await fetch(`${BASE_URL}/companies/${testCompId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ packageOffered: '21 LPA' }),
    });
    assert.strictEqual(putCompRes.status, 200);
    const putCompData = await putCompRes.json();
    console.log('   ✓ Company updated package:', putCompData.data.packageOffered);

    // 8. Companies: DELETE /companies/:id (Admin)
    console.log(`\n8. Testing DELETE /companies/${testCompId} ...`);
    const delCompRes = await fetch(`${BASE_URL}/companies/${testCompId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(delCompRes.status, 200);
    console.log('   ✓ Company deleted successfully.');

    // 9. Placement Drives: GET /drives
    console.log('\n9. Testing GET /drives ...');
    const getDrivesRes = await fetch(`${BASE_URL}/drives`);
    assert.strictEqual(getDrivesRes.status, 200);
    const getDrivesData = await getDrivesRes.json();
    console.log(`   ✓ Retrieved ${getDrivesData.count} placement drives.`);

    // 10. Placement Drives: POST /drives (Company)
    const testDriveId = `DRVTEST${Date.now().toString().slice(-4)}`;
    console.log(`\n10. Testing POST /drives (Creating drive ${testDriveId}) ...`);
    const addDriveRes = await fetch(`${BASE_URL}/drives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${companyToken}`,
      },
      body: JSON.stringify({
        driveId: testDriveId,
        companyId: 'CMP001',
        jobRole: 'Full Stack Engineer',
        driveDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        venue: 'Auditorium Hall C',
        lastDateToApply: new Date(Date.now() + 10 * 86400000).toISOString(),
        vacancies: 8,
      }),
    });
    assert.strictEqual(addDriveRes.status, 201);
    const addDriveData = await addDriveRes.json();
    console.log('   ✓ Drive created:', addDriveData.data.jobRole);

    // 11. Placement Drives: PUT /drives/:id (Company)
    console.log(`\n11. Testing PUT /drives/${testDriveId} ...`);
    const putDriveRes = await fetch(`${BASE_URL}/drives/${testDriveId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${companyToken}`,
      },
      body: JSON.stringify({ vacancies: 12 }),
    });
    assert.strictEqual(putDriveRes.status, 200);
    const putDriveData = await putDriveRes.json();
    console.log('   ✓ Drive updated vacancies to:', putDriveData.data.vacancies);

    // 12. Applications: POST /apply (Student)
    console.log(`\n12. Testing POST /apply (Student applying for ${testDriveId}) ...`);
    const applyRes = await fetch(`${BASE_URL}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        driveId: testDriveId,
      }),
    });
    assert.strictEqual(applyRes.status, 201);
    const applyData = await applyRes.json();
    const createdAppId = applyData.data.applicationId;
    console.log('   ✓ Application created successfully! App ID:', createdAppId);
    console.log('   ✓ Status:', applyData.data.status, '| Selected:', applyData.data.selected);

    // 13. Applications: Duplicate check
    console.log('\n13. Testing POST /apply duplicate prevention ...');
    const dupRes = await fetch(`${BASE_URL}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ driveId: testDriveId }),
    });
    assert.strictEqual(dupRes.status, 400);
    const dupData = await dupRes.json();
    console.log('   ✓ Duplicate prevented as expected:', dupData.message);

    // 14. Applications: GET /applications (Student view)
    console.log('\n14. Testing GET /applications (Student view) ...');
    const stuAppRes = await fetch(`${BASE_URL}/applications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(stuAppRes.status, 200);
    const stuAppData = await stuAppRes.json();
    console.log(`   ✓ Student sees ${stuAppData.count} personal applications.`);

    // 15. Applications: PUT /applications/:id (Company updates selection)
    console.log(`\n15. Testing PUT /applications/${createdAppId} (Updating to Selected) ...`);
    const updateAppRes = await fetch(`${BASE_URL}/applications/${createdAppId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${companyToken}`,
      },
      body: JSON.stringify({
        status: 'Selected',
        selected: true,
      }),
    });
    assert.strictEqual(updateAppRes.status, 200);
    const updateAppData = await updateAppRes.json();
    console.log('   ✓ Application status updated:', updateAppData.data.status);
    console.log('   ✓ Application selected flag:', updateAppData.data.selected);

    // 16. Reports: GET /reports/placement-stats (Admin aggregate())
    console.log('\n16. Testing GET /reports/placement-stats (MongoDB aggregate()) ...');
    const repRes = await fetch(`${BASE_URL}/reports/placement-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(repRes.status, 200);
    const repData = await repRes.json();
    console.log('   ✓ Summary Stats:', repData.data.summary);
    console.log('   ✓ Status Breakdown (aggregate):', repData.data.statusBreakdown);
    console.log('   ✓ Drive Stats count (aggregate):', repData.data.driveStats.length);

    // 17. Cleanup: DELETE /applications/:id and DELETE /drives/:id
    console.log(`\n17. Cleaning up test application and test drive ...`);
    const delAppRes = await fetch(`${BASE_URL}/applications/${createdAppId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(delAppRes.status, 200);
    console.log('   ✓ Application deleted.');

    const delDriveRes = await fetch(`${BASE_URL}/drives/${testDriveId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(delDriveRes.status, 200);
    console.log('   ✓ Drive deleted.');

    // 18. Frontend check
    console.log('\n18. Checking Frontend HTTP response at http://localhost:3000 ...');
    const frontRes = await fetch('http://localhost:3000/');
    assert.strictEqual(frontRes.status, 200);
    const frontHtml = await frontRes.text();
    assert.ok(frontHtml.includes('Campus Placement Management Portal'));
    console.log('   ✓ Frontend is live, serving HTML title "Campus Placement Management Portal"');

    console.log('\n====================================================');
    console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
};

runTests();
