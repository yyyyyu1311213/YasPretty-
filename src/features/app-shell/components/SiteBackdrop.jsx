import './SiteBackdrop.css'

export default function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop__lines" />
      <div className="site-backdrop__marquee site-backdrop__marquee--top">
        <div className="site-backdrop__track">
          <span>CURATED BEAUTY</span><b>✦</b><span>SOFT COLOR</span><b>✦</b><span>FIND YOUR FIT</span><b>✦</b><span>YASPRETTY</span><b>✦</b>
          <span>CURATED BEAUTY</span><b>✦</b><span>SOFT COLOR</span><b>✦</b><span>FIND YOUR FIT</span><b>✦</b><span>YASPRETTY</span><b>✦</b>
        </div>
      </div>
      <div className="site-backdrop__marquee site-backdrop__marquee--bottom">
        <div className="site-backdrop__track">
          <span>YOUR SHADE, YOUR STORY</span><b>✦</b><span>EVERYDAY RITUALS</span><b>✦</b><span>YOU ARE SO PRETTY</span><b>✦</b>
          <span>YOUR SHADE, YOUR STORY</span><b>✦</b><span>EVERYDAY RITUALS</span><b>✦</b><span>YOU ARE SO PRETTY</span><b>✦</b>
        </div>
      </div>
    </div>
  )
}
