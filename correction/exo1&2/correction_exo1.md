
```shell
ansible <host_group> -m ping -i <path_to_inventory>
ansible <host_group> -m apt -a "update_cache=yes" --become -i <path_to_inventory>
ansible <host_group> -m apt -a "name=nginx state=provide" --become -i <path_to_inventory>
ansible <host_group> -m service -a "name=nginx state=started" --become -i <path_to_inventory>
ansible <host_group> -m uri -a "url=http://localhost return_content=yes" -i <path_to_inventory>
```

