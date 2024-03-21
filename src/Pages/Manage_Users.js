import React from 'react'
import UserList from './Redux/UserList'
import {Dashboard} from "./Dashboard";

export const Manage_Users = () => {
return (
<div>
<div style={{width: '82%', float: 'right'}}>
<UserList /> 
</div>

<Dashboard />

</div>
  );
}

export default Manage_Users
