// Distances use a normalized ray; velocity is positive toward the sensor.
export function rayBoxDistance(origin,dx,dy,dz,b,limit){
 let near=.001,far=limit,a,c;
 if(Math.abs(dx)<1e-10){if(origin.x<b.x||origin.x>b.X)return limit;}else{a=(b.x-origin.x)/dx;c=(b.X-origin.x)/dx;if(a>c){const t=a;a=c;c=t;}near=Math.max(near,a);far=Math.min(far,c);if(far<near)return limit;}
 if(Math.abs(dy)<1e-10){if(origin.y<b.y||origin.y>b.Y)return limit;}else{a=(b.y-origin.y)/dy;c=(b.Y-origin.y)/dy;if(a>c){const t=a;a=c;c=t;}near=Math.max(near,a);far=Math.min(far,c);if(far<near)return limit;}
 if(Math.abs(dz)<1e-10){if(origin.z<b.z||origin.z>b.Z)return limit;}else{a=(b.z-origin.z)/dz;c=(b.Z-origin.z)/dz;if(a>c){const t=a;a=c;c=t;}near=Math.max(near,a);far=Math.min(far,c);if(far<near)return limit;}
 return near<limit?near:limit;
}
export function radialVelocity(sensor,target,velocity){const dx=sensor.x-target.x,dy=sensor.y-target.y,dz=sensor.z-target.z;const distance=Math.hypot(dx,dy,dz);return distance>1e-9?(dx*velocity.x+dy*velocity.y+dz*velocity.z)/distance:0;}
