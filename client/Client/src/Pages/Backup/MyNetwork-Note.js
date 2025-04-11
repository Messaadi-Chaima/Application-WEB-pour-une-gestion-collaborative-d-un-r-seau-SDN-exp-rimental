import {Mninet_VM} from './Mninet_VM';
import AppsIcon from '@mui/icons-material/Apps';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

const [openMininet, setOpenMininet] = useState(false);

const handleCloseMininet = () => {
    setOpenMininet(false);
  };
const handleOpenMininet = () => {
    setOpenMininet(true);
  };

//------------------------------Download------------------------------
const handleDownloadConfig = () => {
  if (!network) {
    console.error("Network reference is not defined");
    return;
  }

  const topologyId = 1;
  const hosts = {};
  const switches = {};
  const hostSwitchLinks = [];

  network.body.data.nodes.forEach((node) => {
    if (node.group === "host") {
      hosts[node.id] = {
        intfs: node.options?.intfs.map((intf) => ({
          name: intf.name,
          x: intf.x,
          y: intf.y,
        })),
        position: {
          x: node.x,
          y: node.y,
        },
      };
    } else if (node.group === "switch") {
      switches[node.id] = {
        intfs: node.options?.intfs.map((intf, index) => ({
          name: `${node.id}-eth${index}`,
          x: intf.x,
          y: intf.y,
        })),
        position: {
          x: node.x,
          y: node.y,
        },
      };
    }
  });

  network.body.data.edges.forEach((edge) => {
    const fromNode = network.body.data.nodes.get(edge.from);
    const toNode = network.body.data.nodes.get(edge.to);

    if (fromNode && fromNode.group === "host" && toNode && toNode.group === "switch") {
      hostSwitchLinks.push({
        host: fromNode.id,
        switch: toNode.id,
        host_intf: edge.options.label,
        switch_intf: `${toNode.id}-eth${toNode.options.intfs.findIndex(intf => intf.name === edge.options.label)}`,
      });
    } else if (fromNode && fromNode.group === "switch" && toNode && toNode.group === "host") {
      hostSwitchLinks.push({
        host: toNode.id,
        switch: fromNode.id,
        host_intf: edge.options.label,
        switch_intf: `${fromNode.id}-eth${fromNode.options.intfs.findIndex(intf => intf.name === edge.options.label)}`,
      });
    }
  });

  const config = {
    topology_id: topologyId,
    hosts: hosts,
    switches: switches,
    links: [],
    host_switch_links: hostSwitchLinks,
  };

  const jsonConfig = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonConfig], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "topology_1.json";
  a.click();
  URL.revokeObjectURL(url);
};

      <Mninet_VM
      openMininet={openMininet}
      handleCloseMininet={handleCloseMininet}
      handleOpenMininet={handleOpenMininet}
      visJsRef={visJsRef}
      onNetworkClick={onNetworkClick}
      />
{/*------------------Boutons: Run Stop Save Share---------*/}
      <ToggleButtonGroup
        aria-label="device"
        sx={{ position: 'fixed', top: 80, left: "40%", }}
        >
      <Tooltip title="Save an Experience Configuration ">
        <ToggleButton value="save" aria-label="save">
        <SaveIcon onClick={initializeTopology}/>
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Run ">
        <ToggleButton value="run" aria-label="run">
        <PlayArrowIcon onClick={handleRun}/>
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Stop ">
        <ToggleButton value="stop" aria-label="stop">
          <StopIcon />
        </ToggleButton>
        </Tooltip>
	<Tooltip title="Pause ">
        <ToggleButton value="Pause" aria-label="Pause">
          <PauseIcon />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Replay ">
        <ToggleButton value="Replay" aria-label="Replay">
          <ReplayIcon />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Clean ">
        <ToggleButton value="Clean" aria-label="Clean">
          <CleaningServicesIcon onClick={handleOpenDialogClean} />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Choose the Mininet machine ">
        <ToggleButton value="Choose_the_Mininet_machine" aria-label="Choose the Mininet machine">
          <AppsIcon onClick={handleOpenMininet} />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Share">
        <ToggleButton value="Share" aria-label="Share">
          <IosShareIcon onClick={handleShare} />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Download">
        <ToggleButton value="Download" aria-label="Download">
          <DownloadIcon onClick={handleDownloadConfig} />
        </ToggleButton>
        </Tooltip>
        <Tooltip title="Upload">
        <ToggleButton value="Upload" aria-label="Upload">
          <UploadIcon />
        </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>