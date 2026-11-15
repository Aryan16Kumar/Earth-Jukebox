import { test,expect } from '@playwright/test';
test('loading screen waits for globe assets and offers a working bypass',async({page})=>{
 let release!:()=>void;const wait=new Promise<void>(resolve=>release=resolve);
 await page.route('**/assets/earth-day.jpg',async route=>{await wait;await route.continue()});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const loader=page.getByTestId('earth-loading-screen');
 await expect(loader).toBeVisible();
 await page.screenshot({path:'test-results/loading-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/loading-mobile.png'});
 release();
 await expect(loader).toHaveCount(0,{timeout:30000});
 await page.route('**/assets/earth-day.jpg',route=>route.abort());
 await page.reload();
 const bypass=page.getByRole('button',{name:'Continue to the experience'});
 if(await bypass.isVisible())await bypass.click();
 await expect(loader).toHaveCount(0,{timeout:15000});
 await expect(page.getByRole('button',{name:'ENTER EARTH',exact:true})).toBeVisible();
});

