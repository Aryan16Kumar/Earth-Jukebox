import { test, expect, devices } from '@playwright/test';
test.use({...devices['iPhone 13'],browserName:'webkit'});
test('audio dock remains tappable while mobile details scroll', async({page})=>{
 await page.goto('/explore');
 await page.locator('.region-card').first().click();
 const dock=page.locator('.transport');
 await expect(dock).toBeInViewport();
 expect(await dock.evaluate(el=>el.parentElement===document.body)).toBe(true);
 const pause=page.getByRole('button',{name:'Pause sonification'});
 const play=page.getByRole('button',{name:'Play sonification'});
 await expect(page.locator('.play-button')).toBeEnabled();
 // Windows WebKit may not provide an audio device; validate hit targets independently.
 if(await pause.isVisible())await pause.tap();
 await page.getByRole('button',{name:'Expand details'}).click();
 await page.locator('.listening-room').evaluate(el=>{el.scrollTop=el.scrollHeight});
 await expect(page.locator('.play-button')).toBeInViewport();
 expect(await page.locator('.play-button').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})).toBe(true);
 await page.locator('.play-button').tap();
 await page.screenshot({path:'test-results/iphone-player-webkit.png'});
 await page.setViewportSize({width:844,height:390});
 await expect(page.locator('.play-button')).toBeInViewport();await page.locator('.play-button').tap();
});

