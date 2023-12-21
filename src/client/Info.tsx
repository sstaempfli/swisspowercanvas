function Info(_props: any) {
  return (
    <article>
      <div>
        <p>
          The data always displays the highest possible power output of a power
          plant, which might not be reached at all times. Power plants that are
          not are not in operation anymore are not displayed in the bar chart.
        </p>
        <p>
          We use a logarithmic scale for the color to display the different
          power output levels, as a linear scale would be too sensitive to
          extremely high power output.
        </p>
        <p>
          The data is sourced from the Swiss Federal Office of Topography
          (swisstopo), ensuring the highest standards of data accuracy and
          reliability.
        </p>
        <p>Data Source:</p>
        <a href="https://opendata.swiss/de/dataset/elektrizitatsproduktionsanlagen">
          https://opendata.swiss/de/dataset/elektrizitatsproduktionsanlagen
        </a>
        <span> (last updated on 5.12.23)</span>
      </div>
    </article>
  );
}

export default Info;
