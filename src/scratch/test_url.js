async function test() {
  const id = '1w8o2HjMorFWJXo95inf3Zm3r-aQdBPxZ';
  const u1 = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
  const r1 = await fetch(u1);
  console.log('Thumbnail:', r1.status);
  
  const u2 = `https://drive.google.com/uc?id=${id}`;
  const r2 = await fetch(u2);
  console.log('UC:', r2.status);
  
  const u3 = `https://lh3.googleusercontent.com/d/${id}`;
  const r3 = await fetch(u3);
  console.log('LH3:', r3.status);
}
test();
