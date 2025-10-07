// Adapter component to ensure /event-analysis builds successfully.
// Replace the import below with the exact path to your real page/component inside next/components/**
// Example:
//   import Imported from '../EventAnalysis'
//   import Imported from '../pages/event_analysis/page'
// For now, a placeholder is rendered to avoid build errors.
export default function PageAdapter() {
  return (
    <div style={{padding:16, border:'1px solid #ddd', borderRadius:12}}>
      <h3 style={{margin:0}}>Подключите здесь свой компонент Event Analysis</h3>
      <p style={{marginTop:8, color:'#666'}}>
        Отредактируйте файл <code>next/components/_page/page.tsx</code> и замените содержимое
        на <code>import Imported from '../ПУТЬ_К_ВАШЕМУ_КОМПОНЕНТУ'</code> и верните &lt;Imported /&gt;.
      </p>
    </div>
  );
}
